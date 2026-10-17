import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../../../db";
import { course, courseEnrollment } from "../../../db/schema/course/schema";
import { conversation, conversationParticipant } from "../../../db/schema/conversation/schema";
import { generateConversationKey } from "../../conversation/lib/generate-key";
import { isCourseMessagingEnabled } from "./messaging-settings";
import { isMinor, resolveGuardianUserIds } from "../../../lib/minor-safety";

type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

async function upsertParticipant(
  tx: DbOrTx,
  conversationId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const [existing] = await tx
    .select()
    .from(conversationParticipant)
    .where(
      and(eq(conversationParticipant.conversationId, conversationId), eq(conversationParticipant.userId, userId)),
    )
    .limit(1);

  if (existing) {
    // A deliberate "quitter le groupe" is never auto-reversed by a sync — only an explicit
    // re-add (add-group-participant) clears leftManually.
    if (existing.isDeleted && existing.leftManually) {
      if (isAdmin && !existing.isAdmin) {
        await tx.update(conversationParticipant).set({ isAdmin: true }).where(eq(conversationParticipant.id, existing.id));
      }
      return;
    }
    // Never downgrade an existing admin here — only reassignCourseGroupAdmin strips admin.
    if (existing.isDeleted || (isAdmin && !existing.isAdmin)) {
      await tx
        .update(conversationParticipant)
        .set({ isDeleted: false, deletedAt: null, ...(isAdmin ? { isAdmin: true } : {}) })
        .where(eq(conversationParticipant.id, existing.id));
    }
    return;
  }

  await tx.insert(conversationParticipant).values({
    id: ulid(),
    conversationId,
    userId,
    isAdmin,
    joinedAt: new Date(),
  });
}

/**
 * Idempotent: a course that already has its group returns that group's id immediately. Returns
 * null when course messaging is disabled for the course's club — callers must treat that as
 * "nothing to sync", never as an error.
 */
export async function ensureCourseGroup(courseId: string, tx: DbOrTx = db): Promise<string | null> {
  const [existingConversation] = await tx
    .select({ id: conversation.id })
    .from(conversation)
    .where(eq(conversation.courseId, courseId))
    .limit(1);
  if (existingConversation) return existingConversation.id;

  const [courseRow] = await tx.select().from(course).where(eq(course.id, courseId)).limit(1);
  if (!courseRow) return null;

  if (!(await isCourseMessagingEnabled(courseRow.organizationId))) return null;

  const conversationId = ulid();
  const now = new Date();
  await tx
    .insert(conversation)
    .values({
      id: conversationId,
      type: "group",
      name: courseRow.name,
      courseId,
      organizationId: courseRow.organizationId,
      encryptionKey: generateConversationKey(),
      createdAt: now,
      updatedAt: now,
    })
    // Guards against a race between two callers both finding no existing group — the
    // uniqueIndex on courseId makes the loser's insert a no-op instead of a thrown error.
    .onConflictDoNothing({ target: conversation.courseId });

  const [createdOrRaced] = await tx
    .select({ id: conversation.id })
    .from(conversation)
    .where(eq(conversation.courseId, courseId))
    .limit(1);
  if (!createdOrRaced) return null;

  await upsertParticipant(tx, createdOrRaced.id, courseRow.coachUserId, true);
  return createdOrRaced.id;
}

/**
 * Re-derives the group's full membership from `courseEnrollment` on every call — simpler and
 * safer than tracking deltas, and naturally idempotent (replaying settles on the same state).
 * A guardian stays in the group as long as at least one of their wards is still enrolled.
 */
export async function syncCourseGroupMembers(courseId: string, tx: DbOrTx = db): Promise<void> {
  const [courseRow] = await tx.select().from(course).where(eq(course.id, courseId)).limit(1);
  if (!courseRow) return;

  const conversationId = await ensureCourseGroup(courseId, tx);
  if (!conversationId) return;

  const enrollments = await tx
    .select({ userId: courseEnrollment.userId })
    .from(courseEnrollment)
    .where(eq(courseEnrollment.courseId, courseId));

  const shouldBeIn = new Set<string>([courseRow.coachUserId]);
  for (const { userId } of enrollments) {
    shouldBeIn.add(userId);
    if (await isMinor(userId, courseRow.organizationId)) {
      const { guardianIds } = await resolveGuardianUserIds(userId, courseRow.organizationId);
      guardianIds.forEach((guardianId) => shouldBeIn.add(guardianId));
    }
  }

  for (const userId of shouldBeIn) {
    await upsertParticipant(tx, conversationId, userId, userId === courseRow.coachUserId);
  }

  const activeParticipants = await tx
    .select()
    .from(conversationParticipant)
    .where(
      and(eq(conversationParticipant.conversationId, conversationId), eq(conversationParticipant.isDeleted, false)),
    );

  for (const participant of activeParticipants) {
    if (!shouldBeIn.has(participant.userId)) {
      await tx
        .update(conversationParticipant)
        .set({ isDeleted: true, deletedAt: new Date(), unreadCount: 0 })
        .where(eq(conversationParticipant.id, participant.id));
    }
  }
}

/** The old coach keeps their message history but loses moderation rights; the new coach gets
 * them (and is added to the group if they weren't already a participant). */
export async function reassignCourseGroupAdmin(
  courseId: string,
  oldCoachUserId: string,
  newCoachUserId: string,
  tx: DbOrTx = db,
): Promise<void> {
  if (oldCoachUserId === newCoachUserId) return;

  const conversationId = await ensureCourseGroup(courseId, tx);
  if (!conversationId) return;

  await tx
    .update(conversationParticipant)
    .set({ isAdmin: false })
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, oldCoachUserId),
      ),
    );

  await upsertParticipant(tx, conversationId, newCoachUserId, true);
}

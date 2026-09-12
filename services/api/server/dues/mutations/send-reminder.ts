import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesAssignment, duesType, duesReminderLog, user, organization } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { sendReminderValidator } from "../validators";
import { sendEmail } from "../../../services/mailer";
import { duesReminderEmail } from "../../../services/mailer/templates";

export const sendReminder = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof sendReminderValidator>;

  const [row] = await db
    .select({
      assignmentId: duesAssignment.id,
      status: duesAssignment.status,
      organizationId: duesAssignment.organizationId,
      memberEmail: user.email,
      memberName: user.name,
      duesTypeName: duesType.name,
      amountCents: duesType.amountCents,
      dueDate: duesType.dueDate,
      clubName: organization.name,
    })
    .from(duesAssignment)
    .innerJoin(user, eq(duesAssignment.userId, user.id))
    .innerJoin(duesType, eq(duesAssignment.duesTypeId, duesType.id))
    .innerJoin(organization, eq(duesAssignment.organizationId, organization.id))
    .where(eq(duesAssignment.id, validated.assignmentId))
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Assignment not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, row.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (row.status !== "pending") {
    return c.json(
      { error: "BadRequest", message: "Cannot send a reminder for a paid or waived assignment" },
      400,
    );
  }

  const email = duesReminderEmail({
    clubName: row.clubName,
    memberName: row.memberName,
    duesTypeName: row.duesTypeName,
    amountCents: row.amountCents,
    dueDate: row.dueDate,
  });

  const result = await sendEmail({
    to: row.memberEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (!result.success) {
    return c.json(
      { error: "InternalError", message: `Failed to send reminder: ${result.reason}` },
      500,
    );
  }

  const [log] = await db
    .insert(duesReminderLog)
    .values({
      id: ulid(),
      duesAssignmentId: validated.assignmentId,
      sentByUserId: currentUser.id,
    })
    .returning();

  return c.json(log, 201);
};

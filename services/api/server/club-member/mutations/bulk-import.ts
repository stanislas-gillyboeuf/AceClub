import { Context } from "hono";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { invalidateUserClubIds } from "../../../lib/club-access";
import {
  user,
  member,
  clubMemberProfile,
  household,
  clubTag,
  clubMemberTag,
} from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { makeGhostEmail } from "../../../lib/technical-email";
import { bulkImportValidator } from "../validators";
import { buildImportProfileValues } from "../lib/import-profile";
import {
  normalizeText,
  planImport,
  type ExistingUserRef,
  type PlannedRow,
  type PlanState,
} from "../lib/plan-import";
import { communeLookupKey, resolveCommunes } from "../lib/geo-commune";

type ImportRow = z.infer<typeof bulkImportValidator>["rows"][number];

async function loadPlanState(organizationId: string, rows: ImportRow[]): Promise<PlanState> {
  const emails = [
    ...new Set(rows.map((r) => r.email?.trim().toLowerCase()).filter((e): e is string => !!e)),
  ];

  const [clubRows, emailUsers, households, tags] = await Promise.all([
    db
      .select({
        userId: member.userId,
        name: user.name,
        userDob: user.date_of_birth,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId)),
    emails.length > 0
      ? db
          .select({ id: user.id, email: user.email, name: user.name, dob: user.date_of_birth })
          .from(user)
          .where(inArray(user.email, emails))
      : Promise.resolve([]),
    db
      .select({ id: household.id, name: household.name, contactEmail: household.contactEmail })
      .from(household)
      .where(eq(household.organizationId, organizationId)),
    db
      .select({ id: clubTag.id, name: clubTag.name })
      .from(clubTag)
      .where(eq(clubTag.organizationId, organizationId)),
  ]);

  // THIS club's profile rows only (a person can have a profile in several clubs).
  const profileRows = await db
    .select({
      userId: clubMemberProfile.userId,
      dob: clubMemberProfile.dateOfBirth,
      householdId: clubMemberProfile.householdId,
    })
    .from(clubMemberProfile)
    .where(eq(clubMemberProfile.organizationId, organizationId));
  const profileByUser = new Map(profileRows.map((p) => [p.userId, p]));

  const clubMembers: ExistingUserRef[] = clubRows.map((r) => {
    const profile = profileByUser.get(r.userId);
    return {
      userId: r.userId,
      nameNorm: normalizeText(r.name),
      dateOfBirth: profile?.dob ?? r.userDob ?? null,
      isClubMember: true,
      householdId: profile?.householdId ?? null,
    };
  });
  const memberIds = new Set(clubMembers.map((m) => m.userId));

  const usersByEmail = new Map<string, ExistingUserRef>();
  for (const u of emailUsers) {
    const profile = profileByUser.get(u.id);
    usersByEmail.set(u.email.toLowerCase(), {
      userId: u.id,
      nameNorm: normalizeText(u.name),
      dateOfBirth: profile?.dob ?? u.dob ?? null,
      isClubMember: memberIds.has(u.id),
      householdId: profile?.householdId ?? null,
    });
  }

  return { usersByEmail, clubMembers, households, tags };
}

export const bulkImport = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof bulkImportValidator>;
  const { organizationId, rows } = validated;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  // Everything that reads or calls out happens BEFORE the transaction.
  const state = await loadPlanState(organizationId, rows);
  const plan = planImport(
    rows.map((r) => ({
      name: r.name,
      email: r.email,
      dateOfBirth: r.dateOfBirth,
      householdKey: r.householdKey,
      tags: r.tags,
    })),
    state,
  );

  const warnings = [...plan.warnings];
  const skipped: { row: number; reason: string }[] = [];
  const importRows: PlannedRow[] = [];
  for (const planned of plan.rows) {
    if (planned.kind === "skip") skipped.push({ row: planned.index, reason: planned.reason });
    else importRows.push(planned);
  }

  const communes = await resolveCommunes(
    importRows.map((p) => ({ postalCode: rows[p.index].postalCode, city: rows[p.index].city })),
  );
  const communeOf = (index: number) => {
    const { postalCode, city } = rows[index];
    if (!postalCode && !city) return undefined;
    const resolution = communes.get(communeLookupKey({ postalCode, city }));
    if (resolution?.status === "found") return resolution;
    warnings.push({
      row: index,
      message:
        resolution?.status === "ambiguous"
          ? "Commune ambiguë : à renseigner sur la fiche du membre"
          : resolution?.status === "unavailable"
            ? "Commune non vérifiée (service indisponible) : à renseigner sur la fiche du membre"
            : "Commune introuvable : à renseigner sur la fiche du membre",
    });
    return undefined;
  };
  const communeByIndex = new Map(importRows.map((p) => [p.index, communeOf(p.index)]));

  const knownRefs = new Map<string, ExistingUserRef>();
  for (const ref of state.clubMembers) knownRefs.set(ref.userId, ref);
  for (const ref of state.usersByEmail.values()) if (!knownRefs.has(ref.userId)) knownRefs.set(ref.userId, ref);

  let created = 0;
  let updated = 0;

  const userIdByRow = new Map<number, string>();

  await db.transaction(async (tx) => {
    const createdMemberRows = new Set<number>();

    for (const planned of importRows) {
      const row = rows[planned.index];
      let userId: string;

      if (planned.existingUserId) {
        userId = planned.existingUserId;
        updated++;
      } else {
        const [createdUser] = await tx
          .insert(user)
          .values({
            id: ulid(),
            name: row.name.trim(),
            email: planned.emailKind === "real" && planned.email ? planned.email : makeGhostEmail(),
            emailVerified: false,
            is_ghost: true,
            date_of_birth: row.dateOfBirth,
          })
          .returning({ id: user.id });
        userId = createdUser.id;
        created++;
      }
      userIdByRow.set(planned.index, userId);

      const alreadyMember = knownRefs.get(userId)?.isClubMember ?? false;
      if (!alreadyMember) {
        await tx.insert(member).values({
          id: ulid(),
          organizationId,
          userId,
          role: "member",
          createdAt: new Date(),
        });
        createdMemberRows.add(planned.index);
      }

      // Partial upsert: only the columns this row provides. isNewMember is set for members
      // CREATED by this import only, so a re-import never overwrites a value set by hand.
      const commune = communeByIndex.get(planned.index);
      const profileValues = {
        ...buildImportProfileValues({
          ...row,
          communeInsee: commune?.status === "found" ? commune.code : undefined,
          communeName: commune?.status === "found" ? commune.name : undefined,
        }),
        ...(createdMemberRows.has(planned.index) && validated.isNewMember !== undefined
          ? { isNewMember: validated.isNewMember }
          : {}),
      };
      if (Object.keys(profileValues).length > 0) {
        await tx
          .insert(clubMemberProfile)
          .values({ id: ulid(), userId, organizationId, ...profileValues })
          .onConflictDoUpdate({
            target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
            set: profileValues,
          });
      }
    }

    // Households: created once, then every assignable member is pointed at it.
    for (const planHousehold of plan.households) {
      let householdId = planHousehold.existingHouseholdId;
      if (!householdId) {
        const payerUserId =
          planHousehold.payerRowIndex !== null
            ? (userIdByRow.get(planHousehold.payerRowIndex) ?? null)
            : planHousehold.payerExistingUserId;
        const [createdHousehold] = await tx
          .insert(household)
          .values({
            id: ulid(),
            organizationId,
            name: planHousehold.name,
            contactEmail: planHousehold.contactEmail,
            payerUserId,
          })
          .returning({ id: household.id });
        householdId = createdHousehold.id;
      }

      for (const index of planHousehold.memberRowIndexes) {
        const planned = plan.rows[index];
        const userId = userIdByRow.get(index);
        if (planned.kind !== "import" || !planned.assignHousehold || !userId) continue;
        await tx
          .insert(clubMemberProfile)
          .values({ id: ulid(), userId, organizationId, householdId })
          .onConflictDoUpdate({
            target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
            set: { householdId },
          });
      }
    }

    // Statuses: missing ones are created, then assigned. Existing assignments are never removed.
    const tagIdByKey = new Map<string, string>();
    for (const tag of plan.tags) {
      if (tag.existingId) {
        tagIdByKey.set(tag.key, tag.existingId);
        continue;
      }
      const [createdTag] = await tx
        .insert(clubTag)
        .values({ id: ulid(), organizationId, name: tag.name })
        .onConflictDoNothing()
        .returning({ id: clubTag.id });
      if (createdTag) {
        tagIdByKey.set(tag.key, createdTag.id);
        continue;
      }
      // Lost a race on (organization, name): read the winner.
      const clubTags = await tx
        .select({ id: clubTag.id, name: clubTag.name })
        .from(clubTag)
        .where(eq(clubTag.organizationId, organizationId));
      const existingTag = clubTags.find((t) => normalizeText(t.name) === tag.key);
      if (existingTag) tagIdByKey.set(tag.key, existingTag.id);
    }

    for (const planned of importRows) {
      const userId = userIdByRow.get(planned.index);
      if (!userId) continue;
      for (const key of planned.tagKeys) {
        const tagId = tagIdByKey.get(key);
        if (!tagId) continue;
        await tx
          .insert(clubMemberTag)
          .values({ id: ulid(), organizationId, userId, tagId })
          .onConflictDoNothing();
      }
    }
  });

  await invalidateUserClubIds(...userIdByRow.values());

  return c.json({ created, updated, skipped, warnings, households: plan.households.length });
};

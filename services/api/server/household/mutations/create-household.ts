import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import { and, eq, inArray } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household, clubMemberProfile, member } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { createHouseholdValidator } from "../validators";

export const createHousehold = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createHouseholdValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (validated.payerUserId && !(await isOrgMember(validated.payerUserId, validated.organizationId))) {
    return c.json({ error: "BadRequest", message: "The payer must be a member of this club" }, 400);
  }

  const memberUserIds = [...new Set(validated.memberUserIds ?? [])];
  if (memberUserIds.length > 0) {
    const found = await db
      .select({ userId: member.userId })
      .from(member)
      .where(and(eq(member.organizationId, validated.organizationId), inArray(member.userId, memberUserIds)));
    if (found.length !== memberUserIds.length) {
      return c.json({ error: "BadRequest", message: "One or more members do not belong to this club" }, 400);
    }
  }

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(household)
      .values({
        id: ulid(),
        organizationId: validated.organizationId,
        name: validated.name,
        payerUserId: validated.payerUserId ?? null,
        contactEmail: validated.contactEmail?.toLowerCase() ?? null,
      })
      .returning();

    for (const userId of memberUserIds) {
      await tx
        .insert(clubMemberProfile)
        .values({ id: ulid(), userId, organizationId: validated.organizationId, householdId: row.id })
        .onConflictDoUpdate({
          target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
          set: { householdId: row.id },
        });
    }
    return row;
  });

  return c.json({ household: created }, 201);
};

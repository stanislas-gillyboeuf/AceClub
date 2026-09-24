import { Context } from "hono";
import { z } from "zod";
import { ulid } from "ulid";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household, clubMemberProfile } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { setMemberHouseholdValidator } from "../validators";

/** Assigns a member to a household of the same club, or removes them (`householdId: null`). */
export const setMemberHousehold = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof setMemberHouseholdValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (!(await isOrgMember(validated.userId, validated.organizationId))) {
    return c.json({ error: "NotFound", message: "Member not found in this club" }, 404);
  }

  if (validated.householdId) {
    const [target] = await db
      .select({ id: household.id })
      .from(household)
      .where(and(eq(household.id, validated.householdId), eq(household.organizationId, validated.organizationId)))
      .limit(1);
    if (!target) {
      return c.json({ error: "NotFound", message: "Household not found" }, 404);
    }
  }

  await db
    .insert(clubMemberProfile)
    .values({
      id: ulid(),
      userId: validated.userId,
      organizationId: validated.organizationId,
      householdId: validated.householdId,
    })
    .onConflictDoUpdate({
      target: [clubMemberProfile.userId, clubMemberProfile.organizationId],
      set: { householdId: validated.householdId },
    });

  return c.json({ userId: validated.userId, householdId: validated.householdId });
};

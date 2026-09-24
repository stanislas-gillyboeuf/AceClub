import { publicEmail } from "../../../lib/technical-email";
import { Context } from "hono";
import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household, clubMemberProfile, member, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isEffectiveAdherent } from "../../club-member/lib/adherent";
import { getHouseholdValidator } from "../validators";

export const getHousehold = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getHouseholdValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [row] = await db
    .select()
    .from(household)
    .where(and(eq(household.id, validated.householdId), eq(household.organizationId, validated.organizationId)))
    .limit(1);
  if (!row) {
    return c.json({ error: "NotFound", message: "Household not found" }, 404);
  }

  const memberRows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      isAdherentOverride: clubMemberProfile.isAdherent,
      householdRankOverride: clubMemberProfile.householdRank,
    })
    .from(clubMemberProfile)
    .innerJoin(user, eq(clubMemberProfile.userId, user.id))
    .innerJoin(
      member,
      and(eq(member.userId, clubMemberProfile.userId), eq(member.organizationId, clubMemberProfile.organizationId)),
    )
    .where(
      and(
        eq(clubMemberProfile.householdId, row.id),
        eq(clubMemberProfile.organizationId, validated.organizationId),
      ),
    )
    .orderBy(asc(user.name));

  return c.json({
    household: row,
    members: memberRows.map((m) => ({
      userId: m.userId,
      name: m.name,
      email: publicEmail(m.email),
      role: m.role,
      isAdherent: isEffectiveAdherent(m.isAdherentOverride, m.role),
      householdRankOverride: m.householdRankOverride,
      isPayer: m.userId === row.payerUserId,
    })),
  });
};

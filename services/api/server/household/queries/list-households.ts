import { Context } from "hono";
import { z } from "zod";
import { asc, eq, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household, clubMemberProfile, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listHouseholdsValidator } from "../validators";

export const listHouseholds = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listHouseholdsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const households = await db
    .select({
      id: household.id,
      name: household.name,
      payerUserId: household.payerUserId,
      payerName: user.name,
      contactEmail: household.contactEmail,
      memberCount: sql<number>`count(${clubMemberProfile.id})::int`,
    })
    .from(household)
    .leftJoin(user, eq(household.payerUserId, user.id))
    .leftJoin(clubMemberProfile, eq(clubMemberProfile.householdId, household.id))
    .where(eq(household.organizationId, validated.organizationId))
    .groupBy(household.id, user.name)
    .orderBy(asc(household.name));

  return c.json({ households });
};

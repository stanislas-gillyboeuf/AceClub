import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteHouseholdValidator } from "../validators";

// Members are kept: `club_member_profile.household_id` is `ON DELETE SET NULL`.
export const deleteHousehold = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteHouseholdValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const deleted = await db
    .delete(household)
    .where(and(eq(household.id, validated.householdId), eq(household.organizationId, validated.organizationId)))
    .returning({ id: household.id });

  if (deleted.length === 0) {
    return c.json({ error: "NotFound", message: "Household not found" }, 404);
  }
  return c.json({ success: true });
};

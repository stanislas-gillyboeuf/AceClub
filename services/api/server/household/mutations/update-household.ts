import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { household } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { updateHouseholdValidator } from "../validators";

export const updateHousehold = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateHouseholdValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [existing] = await db
    .select({ id: household.id })
    .from(household)
    .where(and(eq(household.id, validated.householdId), eq(household.organizationId, validated.organizationId)))
    .limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Household not found" }, 404);
  }

  if (validated.payerUserId && !(await isOrgMember(validated.payerUserId, validated.organizationId))) {
    return c.json({ error: "BadRequest", message: "The payer must be a member of this club" }, 400);
  }

  // Partial update: only the fields actually sent are written (null clears payer/contact).
  const values: Partial<typeof household.$inferInsert> = {};
  if (validated.name !== undefined) values.name = validated.name;
  if ("payerUserId" in validated) values.payerUserId = validated.payerUserId ?? null;
  if ("contactEmail" in validated) values.contactEmail = validated.contactEmail?.toLowerCase() ?? null;

  if (Object.keys(values).length === 0) {
    const [current] = await db.select().from(household).where(eq(household.id, existing.id)).limit(1);
    return c.json({ household: current });
  }

  const [updated] = await db
    .update(household)
    .set(values)
    .where(and(eq(household.id, validated.householdId), eq(household.organizationId, validated.organizationId)))
    .returning();

  return c.json({ household: updated });
};

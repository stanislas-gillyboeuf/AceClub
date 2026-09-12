import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateDuesTypeValidator } from "../validators";

export const updateDuesType = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateDuesTypeValidator>;

  const [existing] = await db
    .select()
    .from(duesType)
    .where(eq(duesType.id, validated.duesTypeId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Dues type not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const updateData: Record<string, unknown> = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.amountCents !== undefined) updateData.amountCents = validated.amountCents;
  if (validated.dueDate !== undefined)
    updateData.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
  if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

  const [updated] = await db
    .update(duesType)
    .set(updateData)
    .where(eq(duesType.id, validated.duesTypeId))
    .returning();

  return c.json(updated);
};

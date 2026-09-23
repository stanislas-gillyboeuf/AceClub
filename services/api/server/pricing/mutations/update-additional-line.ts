import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifAdditionalLine } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { updateAdditionalLineValidator } from "../validators";

export const updateAdditionalLine = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateAdditionalLineValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);
  const additionalLineId = idMaps.additionalLine.get(validated.additionalLineId) ?? validated.additionalLineId;

  const updates: Partial<typeof tarifAdditionalLine.$inferInsert> = {};
  if (validated.name !== undefined) updates.name = validated.name;
  if (validated.amountCents !== undefined) updates.amountCents = validated.amountCents;
  if (validated.conditions !== undefined) updates.conditions = validated.conditions;
  if (validated.isActive !== undefined) updates.isActive = validated.isActive;
  if (validated.sortOrder !== undefined) updates.sortOrder = validated.sortOrder;

  const [updated] = await db
    .update(tarifAdditionalLine)
    .set(updates)
    .where(and(eq(tarifAdditionalLine.id, additionalLineId), eq(tarifAdditionalLine.tarifGridId, gridId)))
    .returning();

  if (!updated) {
    return c.json({ error: "NotFound", message: "Additional line not found" }, 404);
  }

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: `Ligne additionnelle "${updated.name}" modifiée`,
  });

  return c.json({ gridId, additionalLine: updated });
};

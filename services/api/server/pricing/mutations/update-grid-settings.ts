import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { updateGridSettingsValidator } from "../validators";

export const updateGridSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateGridSettingsValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);

  const updates: Partial<typeof tarifGrid.$inferInsert> = {};
  if (validated.seasonLabel !== undefined) updates.seasonLabel = validated.seasonLabel;
  if (validated.seasonStartDate !== undefined) updates.seasonStartDate = new Date(validated.seasonStartDate);
  if (validated.seasonEndDate !== undefined) updates.seasonEndDate = new Date(validated.seasonEndDate);
  if (validated.ageReferenceMode !== undefined) updates.ageReferenceMode = validated.ageReferenceMode;
  if (validated.cumulMode !== undefined) updates.cumulMode = validated.cumulMode;
  if (validated.reductionCapPercent !== undefined) updates.reductionCapPercent = validated.reductionCapPercent;
  if (validated.roundingIncrement !== undefined) updates.roundingIncrement = validated.roundingIncrement;

  const [updated] = await db
    .update(tarifGrid)
    .set(updates)
    .where(eq(tarifGrid.id, gridId))
    .returning();

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: "Paramètres de la grille modifiés",
  });

  return c.json({ grid: updated });
};

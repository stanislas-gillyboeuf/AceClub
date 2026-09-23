import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifRule } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { createRuleValidator } from "../validators";

export const createRule = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createRuleValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);

  const targetAdditionalLineId = validated.targetAdditionalLineId
    ? idMaps.additionalLine.get(validated.targetAdditionalLineId) ?? validated.targetAdditionalLineId
    : null;

  const [created] = await db
    .insert(tarifRule)
    .values({
      tarifGridId: gridId,
      name: validated.name,
      conditions: validated.conditions,
      effectType: validated.effectType,
      effectValue: validated.effectValue,
      targetType: validated.targetType,
      targetAdditionalLineId,
      exclusivityGroup: validated.exclusivityGroup ?? null,
      isActive: validated.isActive,
      sortOrder: validated.sortOrder,
    })
    .returning();

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: `Règle "${validated.name}" créée`,
  });

  return c.json({ gridId, rule: created }, 201);
};

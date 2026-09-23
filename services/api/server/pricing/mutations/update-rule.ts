import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifRule } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { updateRuleValidator } from "../validators";

export const updateRule = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateRuleValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);
  const ruleId = idMaps.rule.get(validated.ruleId) ?? validated.ruleId;

  const [currentRow] = await db
    .select()
    .from(tarifRule)
    .where(and(eq(tarifRule.id, ruleId), eq(tarifRule.tarifGridId, gridId)))
    .limit(1);
  if (!currentRow) {
    return c.json({ error: "NotFound", message: "Rule not found" }, 404);
  }

  const nextTargetType = validated.targetType ?? currentRow.targetType;
  const nextTargetAdditionalLineId =
    validated.targetAdditionalLineId !== undefined
      ? validated.targetAdditionalLineId
        ? idMaps.additionalLine.get(validated.targetAdditionalLineId) ?? validated.targetAdditionalLineId
        : null
      : currentRow.targetAdditionalLineId;

  if (nextTargetType === "additional_line" && !nextTargetAdditionalLineId) {
    return c.json(
      { error: "BadRequest", message: "targetAdditionalLineId is required when targetType is 'additional_line'" },
      400,
    );
  }

  const updates: Partial<typeof tarifRule.$inferInsert> = {};
  if (validated.name !== undefined) updates.name = validated.name;
  if (validated.conditions !== undefined) updates.conditions = validated.conditions;
  if (validated.effectType !== undefined) updates.effectType = validated.effectType;
  if (validated.effectValue !== undefined) updates.effectValue = validated.effectValue;
  if (validated.targetType !== undefined) updates.targetType = validated.targetType;
  if (validated.targetAdditionalLineId !== undefined) updates.targetAdditionalLineId = nextTargetAdditionalLineId;
  if (validated.exclusivityGroup !== undefined) updates.exclusivityGroup = validated.exclusivityGroup;
  if (validated.isActive !== undefined) updates.isActive = validated.isActive;
  if (validated.sortOrder !== undefined) updates.sortOrder = validated.sortOrder;

  const [updated] = await db
    .update(tarifRule)
    .set(updates)
    .where(and(eq(tarifRule.id, ruleId), eq(tarifRule.tarifGridId, gridId)))
    .returning();

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: `Règle "${updated.name}" modifiée`,
  });

  return c.json({ gridId, rule: updated });
};

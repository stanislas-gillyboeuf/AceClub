import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifRule } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { duplicateRuleValidator } from "../validators";

export const duplicateRule = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof duplicateRuleValidator>;

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

  const [source] = await db
    .select()
    .from(tarifRule)
    .where(and(eq(tarifRule.id, ruleId), eq(tarifRule.tarifGridId, gridId)))
    .limit(1);
  if (!source) {
    return c.json({ error: "NotFound", message: "Rule not found" }, 404);
  }

  const [duplicated] = await db
    .insert(tarifRule)
    .values({
      tarifGridId: gridId,
      name: `${source.name} (copie)`,
      conditions: source.conditions,
      effectType: source.effectType,
      effectValue: source.effectValue,
      targetType: source.targetType,
      targetAdditionalLineId: source.targetAdditionalLineId,
      exclusivityGroup: source.exclusivityGroup,
      isActive: source.isActive,
      sortOrder: source.sortOrder + 1,
    })
    .returning();

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "duplicated",
    summary: `Règle "${source.name}" dupliquée`,
  });

  return c.json({ gridId, rule: duplicated }, 201);
};

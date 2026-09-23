import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifRule } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { reorderRulesValidator } from "../validators";

export const reorderRules = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof reorderRulesValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const { gridId, idMaps } = await getOrCreateEditableVersion(validated.gridId, currentUser.id);
  const orderedRuleIds = validated.orderedRuleIds.map((id) => idMaps.rule.get(id) ?? id);

  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedRuleIds.length; i++) {
      await tx
        .update(tarifRule)
        .set({ sortOrder: i })
        .where(eq(tarifRule.id, orderedRuleIds[i]));
    }
  });

  const rules = await db.select().from(tarifRule).where(eq(tarifRule.tarifGridId, gridId));

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: "Ordre des règles modifié",
  });

  return c.json({ gridId, rules });
};

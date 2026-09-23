import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid, tarifAdditionalLine } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getOrCreateEditableVersion } from "../lib/versioning";
import { logGridAudit } from "../lib/audit";
import { deleteAdditionalLineValidator } from "../validators";

// A tarifRule referencing this line (targetAdditionalLineId) is deleted along with it via the
// FK's ON DELETE CASCADE — a rule can never dangle on a removed additional line.
export const deleteAdditionalLine = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteAdditionalLineValidator>;

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

  await db
    .delete(tarifAdditionalLine)
    .where(and(eq(tarifAdditionalLine.id, additionalLineId), eq(tarifAdditionalLine.tarifGridId, gridId)));

  await logGridAudit({
    tarifGridId: gridId,
    organizationId: existing.organizationId,
    actorUserId: currentUser.id,
    action: "updated",
    summary: "Ligne additionnelle supprimée",
  });

  return c.json({ gridId, success: true });
};

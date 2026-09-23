import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { logGridAudit } from "../lib/audit";
import { activateGridValidator } from "../validators";

export const activateGrid = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof activateGridValidator>;

  const [existing] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!existing) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (existing.status !== "draft") {
    return c.json({ error: "BadRequest", message: "Only a draft grid can be activated" }, 400);
  }

  const activated = await db.transaction(async (tx) => {
    await tx
      .update(tarifGrid)
      .set({ status: "archived", archivedAt: new Date() })
      .where(
        and(
          eq(tarifGrid.organizationId, existing.organizationId),
          eq(tarifGrid.seasonLabel, existing.seasonLabel),
          eq(tarifGrid.status, "active"),
        ),
      );

    const [updated] = await tx
      .update(tarifGrid)
      .set({ status: "active", activatedAt: new Date() })
      .where(eq(tarifGrid.id, existing.id))
      .returning();

    return updated;
  });

  await logGridAudit({
    tarifGridId: activated.id,
    organizationId: activated.organizationId,
    actorUserId: currentUser.id,
    action: "activated",
    summary: "Grille activée",
  });

  return c.json({ grid: activated });
};

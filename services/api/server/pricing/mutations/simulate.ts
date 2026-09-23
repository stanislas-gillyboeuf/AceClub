import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { buildGridSnapshot } from "../lib/snapshot";
import { computeCotisation } from "../lib/engine";
import { simulateValidator } from "../validators";

// Read-only — never calls getOrCreateEditableVersion, never touches any row.
export const simulate = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof simulateValidator>;

  const [grid] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.gridId)).limit(1);
  if (!grid) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, grid.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const snapshot = await buildGridSnapshot(grid.id);
  const breakdown = computeCotisation(snapshot, validated.profile);

  return c.json(breakdown);
};

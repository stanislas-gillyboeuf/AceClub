import { Context } from "hono";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listGridsValidator } from "../validators";

// History for a season = every version of every family for that (org, season) — a treasurer
// reviews it as a flat, newest-first list rather than needing to understand version chaining.
export const listGrids = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listGridsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const conditions = [eq(tarifGrid.organizationId, validated.organizationId)];
  if (validated.seasonLabel) {
    conditions.push(eq(tarifGrid.seasonLabel, validated.seasonLabel));
  }

  const grids = await db
    .select()
    .from(tarifGrid)
    .where(and(...conditions))
    .orderBy(desc(tarifGrid.createdAt));

  return c.json({ grids });
};

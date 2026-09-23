import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tarifGrid } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getActiveGridValidator } from "../validators";

export const getActiveGrid = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getActiveGridValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [grid] = await db
    .select()
    .from(tarifGrid)
    .where(
      and(
        eq(tarifGrid.organizationId, validated.organizationId),
        eq(tarifGrid.seasonLabel, validated.seasonLabel),
        eq(tarifGrid.status, "active"),
      ),
    )
    .limit(1);

  return c.json({ grid: grid ?? null });
};

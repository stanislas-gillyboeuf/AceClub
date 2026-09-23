import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifAdditionalLine,
  tarifRule,
} from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { buildGridSnapshot } from "../lib/snapshot";
import { computeGridWarnings } from "../lib/warnings";
import { getGridValidator } from "../validators";

export const getGrid = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getGridValidator>;

  const [grid] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, validated.id)).limit(1);
  if (!grid) {
    return c.json({ error: "NotFound", message: "Grid not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, grid.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [ageCategories, baseRates, lessonRates, additionalLines, rules] = await Promise.all([
    db
      .select()
      .from(tarifAgeCategory)
      .where(eq(tarifAgeCategory.tarifGridId, grid.id))
      .orderBy(asc(tarifAgeCategory.sortOrder)),
    db.select().from(tarifBaseRate).where(eq(tarifBaseRate.tarifGridId, grid.id)),
    db.select().from(tarifLessonRate).where(eq(tarifLessonRate.tarifGridId, grid.id)),
    db
      .select()
      .from(tarifAdditionalLine)
      .where(eq(tarifAdditionalLine.tarifGridId, grid.id))
      .orderBy(asc(tarifAdditionalLine.sortOrder)),
    db.select().from(tarifRule).where(eq(tarifRule.tarifGridId, grid.id)).orderBy(asc(tarifRule.sortOrder)),
  ]);

  const snapshot = await buildGridSnapshot(grid.id);
  const warnings = computeGridWarnings(snapshot);

  return c.json({
    grid,
    ageCategories,
    baseRates,
    lessonRates,
    additionalLines,
    rules,
    warnings,
  });
};

import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { tarifAdditionalLine, tarifAgeCategory } from "../../../db/schema";

// Checked against the grid the client sent (BEFORE any copy-on-write clone), because the client's
// ids are the ones it fetched from that grid; versioning.ts translates them afterwards.
export async function categoriesBelongToGrid(gridId: string, categoryIds: string[]): Promise<boolean> {
  const unique = [...new Set(categoryIds)];
  if (unique.length === 0) return true;
  const rows = await db
    .select({ id: tarifAgeCategory.id })
    .from(tarifAgeCategory)
    .where(and(eq(tarifAgeCategory.tarifGridId, gridId), inArray(tarifAgeCategory.id, unique)));
  return rows.length === unique.length;
}

export async function additionalLineBelongsToGrid(gridId: string, additionalLineId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: tarifAdditionalLine.id })
    .from(tarifAdditionalLine)
    .where(and(eq(tarifAdditionalLine.tarifGridId, gridId), eq(tarifAdditionalLine.id, additionalLineId)))
    .limit(1);
  return !!row;
}

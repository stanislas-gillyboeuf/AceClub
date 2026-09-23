import { asc, eq } from "drizzle-orm";
import { db } from "../../../db";
import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifAdditionalLine,
  tarifRule,
} from "../../../db/schema";
import type { TarifCondition, TarifGridSnapshot } from "./engine";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Loads a grid and all its child rows, flattened into the plain-object shape the pure engine expects. */
export async function buildGridSnapshot(gridId: string): Promise<TarifGridSnapshot> {
  const [grid] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, gridId)).limit(1);
  if (!grid) {
    throw new Error(`Tarif grid not found: ${gridId}`);
  }

  const [ageCategories, baseRates, lessonRates, additionalLines, rules] = await Promise.all([
    db
      .select()
      .from(tarifAgeCategory)
      .where(eq(tarifAgeCategory.tarifGridId, gridId))
      .orderBy(asc(tarifAgeCategory.sortOrder)),
    db.select().from(tarifBaseRate).where(eq(tarifBaseRate.tarifGridId, gridId)),
    db.select().from(tarifLessonRate).where(eq(tarifLessonRate.tarifGridId, gridId)),
    db
      .select()
      .from(tarifAdditionalLine)
      .where(eq(tarifAdditionalLine.tarifGridId, gridId))
      .orderBy(asc(tarifAdditionalLine.sortOrder)),
    db.select().from(tarifRule).where(eq(tarifRule.tarifGridId, gridId)).orderBy(asc(tarifRule.sortOrder)),
  ]);

  return {
    ageReferenceMode: grid.ageReferenceMode,
    cumulMode: grid.cumulMode,
    reductionCapPercent: grid.reductionCapPercent,
    roundingIncrement: grid.roundingIncrement,
    seasonStartDate: toIsoDate(grid.seasonStartDate),
    seasonEndDate: toIsoDate(grid.seasonEndDate),
    ageCategories: ageCategories.map((c) => ({
      id: c.id,
      name: c.name,
      minAge: c.minAge,
      maxAge: c.maxAge,
      sortOrder: c.sortOrder,
    })),
    baseRates: baseRates.map((r) => ({
      categoryId: r.categoryId,
      membershipFeeCents: r.membershipFeeCents,
      licenseFeeCents: r.licenseFeeCents,
    })),
    lessonRates: lessonRates.map((r) => ({
      categoryId: r.categoryId,
      lessonsPerWeek: r.lessonsPerWeek,
      priceCents: r.priceCents,
    })),
    additionalLines: additionalLines.map((l) => ({
      id: l.id,
      name: l.name,
      amountCents: l.amountCents,
      conditions: l.conditions as TarifCondition[],
      isActive: l.isActive,
      sortOrder: l.sortOrder,
    })),
    rules: rules.map((r) => ({
      id: r.id,
      name: r.name,
      conditions: r.conditions as TarifCondition[],
      effectType: r.effectType,
      effectValue: r.effectValue,
      targetType: r.targetType,
      targetAdditionalLineId: r.targetAdditionalLineId,
      exclusivityGroup: r.exclusivityGroup,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
    })),
  };
}

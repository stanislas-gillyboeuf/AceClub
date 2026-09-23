import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../../../db";
import {
  tarifGrid,
  tarifAgeCategory,
  tarifBaseRate,
  tarifLessonRate,
  tarifAdditionalLine,
  tarifRule,
} from "../../../db/schema";

export interface EditableVersionIdMaps {
  ageCategory: Map<string, string>;
  additionalLine: Map<string, string>;
  rule: Map<string, string>;
}

export interface EditableVersionResult {
  gridId: string;
  wasCloned: boolean;
  idMaps: EditableVersionIdMaps;
}

const emptyMaps = (): EditableVersionIdMaps => ({
  ageCategory: new Map(),
  additionalLine: new Map(),
  rule: new Map(),
});

// Minimal transaction-shaped type accepted by clone helpers — matches both `db` and the `tx`
// passed into `db.transaction(async (tx) => ...)`.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Clones every child row (age categories, base rates, lesson rates, additional lines, rules)
 * from `sourceGridId` into `targetGridId`, remapping internal FKs (category id on rates,
 * additional-line id on rules) to the newly-created rows. Does NOT touch the `tarifGrid` row
 * itself — callers create/update that separately. Shared by `getOrCreateEditableVersion`
 * (active -> draft-equivalent clone) and `create-grid`'s "duplicate from previous season" mode.
 */
export async function cloneGridChildren(
  tx: Tx,
  sourceGridId: string,
  targetGridId: string,
): Promise<EditableVersionIdMaps> {
  const ageCategoryMap = new Map<string, string>();
  const categories = await tx
    .select()
    .from(tarifAgeCategory)
    .where(eq(tarifAgeCategory.tarifGridId, sourceGridId));
  for (const cat of categories) {
    const newId = ulid();
    ageCategoryMap.set(cat.id, newId);
    await tx.insert(tarifAgeCategory).values({
      id: newId,
      tarifGridId: targetGridId,
      name: cat.name,
      minAge: cat.minAge,
      maxAge: cat.maxAge,
      sortOrder: cat.sortOrder,
    });
  }

  const baseRates = await tx
    .select()
    .from(tarifBaseRate)
    .where(eq(tarifBaseRate.tarifGridId, sourceGridId));
  for (const rate of baseRates) {
    await tx.insert(tarifBaseRate).values({
      id: ulid(),
      tarifGridId: targetGridId,
      categoryId: ageCategoryMap.get(rate.categoryId)!,
      membershipFeeCents: rate.membershipFeeCents,
      licenseFeeCents: rate.licenseFeeCents,
    });
  }

  const lessonRates = await tx
    .select()
    .from(tarifLessonRate)
    .where(eq(tarifLessonRate.tarifGridId, sourceGridId));
  for (const rate of lessonRates) {
    await tx.insert(tarifLessonRate).values({
      id: ulid(),
      tarifGridId: targetGridId,
      categoryId: ageCategoryMap.get(rate.categoryId)!,
      lessonsPerWeek: rate.lessonsPerWeek,
      priceCents: rate.priceCents,
    });
  }

  const additionalLineMap = new Map<string, string>();
  const additionalLines = await tx
    .select()
    .from(tarifAdditionalLine)
    .where(eq(tarifAdditionalLine.tarifGridId, sourceGridId));
  for (const line of additionalLines) {
    const newId = ulid();
    additionalLineMap.set(line.id, newId);
    await tx.insert(tarifAdditionalLine).values({
      id: newId,
      tarifGridId: targetGridId,
      name: line.name,
      amountCents: line.amountCents,
      conditions: line.conditions,
      isActive: line.isActive,
      sortOrder: line.sortOrder,
    });
  }

  const ruleMap = new Map<string, string>();
  const rules = await tx.select().from(tarifRule).where(eq(tarifRule.tarifGridId, sourceGridId));
  for (const rule of rules) {
    const newId = ulid();
    ruleMap.set(rule.id, newId);
    await tx.insert(tarifRule).values({
      id: newId,
      tarifGridId: targetGridId,
      name: rule.name,
      conditions: rule.conditions,
      effectType: rule.effectType,
      effectValue: rule.effectValue,
      targetType: rule.targetType,
      targetAdditionalLineId: rule.targetAdditionalLineId
        ? additionalLineMap.get(rule.targetAdditionalLineId)!
        : null,
      exclusivityGroup: rule.exclusivityGroup,
      isActive: rule.isActive,
      sortOrder: rule.sortOrder,
    });
  }

  return { ageCategory: ageCategoryMap, additionalLine: additionalLineMap, rule: ruleMap };
}

/**
 * Ensures the caller can edit `gridId` in place. A "draft" grid is returned as-is. An "active"
 * grid is NEVER mutated in place — this clones it (new id, version+1, same familyId,
 * previousVersionId set) plus every child row, archives the old row, and returns the new id.
 * The UI only ever shows draft/active; this chaining is invisible to the treasurer.
 *
 * IMPORTANT: any mutation that resolves a client-supplied child id (age category id,
 * additional-line id, rule id) in the SAME call that may trigger this clone must translate that
 * id through the returned `idMaps` first — the client's id may reference the pre-clone row.
 */
export async function getOrCreateEditableVersion(
  gridId: string,
  actorUserId: string,
): Promise<EditableVersionResult> {
  const [grid] = await db.select().from(tarifGrid).where(eq(tarifGrid.id, gridId)).limit(1);
  if (!grid) {
    throw new Error(`Tarif grid not found: ${gridId}`);
  }

  if (grid.status === "draft") {
    return { gridId: grid.id, wasCloned: false, idMaps: emptyMaps() };
  }

  if (grid.status === "archived") {
    throw new Error(`Cannot edit an archived grid: ${gridId}`);
  }

  // status === "active" — copy-on-write clone.
  return db.transaction(async (tx) => {
    const newGridId = ulid();

    await tx.insert(tarifGrid).values({
      id: newGridId,
      organizationId: grid.organizationId,
      familyId: grid.familyId,
      version: grid.version + 1,
      previousVersionId: grid.id,
      seasonLabel: grid.seasonLabel,
      seasonStartDate: grid.seasonStartDate,
      seasonEndDate: grid.seasonEndDate,
      ageReferenceMode: grid.ageReferenceMode,
      cumulMode: grid.cumulMode,
      reductionCapPercent: grid.reductionCapPercent,
      roundingIncrement: grid.roundingIncrement,
      status: "active",
      createdByUserId: actorUserId,
      activatedAt: grid.activatedAt,
    });

    const idMaps = await cloneGridChildren(tx, grid.id, newGridId);

    await tx
      .update(tarifGrid)
      .set({ status: "archived", archivedAt: new Date() })
      .where(eq(tarifGrid.id, grid.id));

    return { gridId: newGridId, wasCloned: true, idMaps };
  });
}

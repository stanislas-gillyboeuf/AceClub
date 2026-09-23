import { distributeProportionally } from "./allocation";
import type { BaseLine, BreakdownLine, LineAdjustment, TarifRoundingIncrement } from "./types";

/**
 * Step 8: apply the optional global reduction cap (a percentage of the total EXCLUDING the
 * license line — license reductions are never capped, they're blocked upstream in rules.ts by
 * default) by scaling down each line's discount proportionally, then the floor (no line ever
 * goes below zero). Never mutates its inputs.
 */
export function applyCapAndFloorPerLine(
  baseLines: BaseLine[],
  lineAdjustments: Record<string, LineAdjustment>,
  reductionCapPercent: number | null,
): { lines: BreakdownLine[]; capApplied: boolean } {
  let capApplied = false;
  const adjustments: Record<string, LineAdjustment> = {};
  for (const line of baseLines) {
    adjustments[line.key] = { ...lineAdjustments[line.key] };
  }

  if (reductionCapPercent !== null) {
    const nonLicenseLines = baseLines.filter((l) => l.key !== "license" && adjustments[l.key].fixedOverrideCents === null);
    const sumBase = nonLicenseLines.reduce((s, l) => s + l.baseAmountCents, 0);
    const totalReduction = nonLicenseLines.reduce((s, l) => s + adjustments[l.key].reductionCents, 0);
    const capCents = Math.floor((sumBase * reductionCapPercent) / 100);

    if (totalReduction > capCents) {
      capApplied = true;
      const weights = nonLicenseLines
        .filter((l) => adjustments[l.key].reductionCents > 0)
        .map((l) => ({ key: l.key, weight: adjustments[l.key].reductionCents }));
      const scaled = distributeProportionally(capCents, weights);
      for (const w of weights) {
        adjustments[w.key] = { ...adjustments[w.key], reductionCents: scaled[w.key] ?? 0 };
      }
    }
  }

  const lines: BreakdownLine[] = baseLines.map((line) => {
    const adj = adjustments[line.key];
    const rawFinal =
      adj.fixedOverrideCents !== null ? adj.fixedOverrideCents : line.baseAmountCents + adj.surchargeCents - adj.reductionCents;
    const finalAmountCents = Math.max(0, rawFinal); // plancher : jamais de ligne négative
    return { key: line.key, label: line.label, baseAmountCents: line.baseAmountCents, finalAmountCents };
  });

  return { lines, capApplied };
}

/** Step 9: round the total DOWN to the configured increment. Integer cents in, integer cents out. */
export function roundTotal(totalCents: number, increment: TarifRoundingIncrement): number {
  switch (increment) {
    case "none":
      return totalCents;
    case "fifty_cents":
      return Math.floor(totalCents / 50) * 50;
    case "one_euro":
      return Math.floor(totalCents / 100) * 100;
  }
}

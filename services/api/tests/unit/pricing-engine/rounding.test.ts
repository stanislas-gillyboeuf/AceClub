import { describe, it, expect } from "vitest";
import { applyCapAndFloorPerLine, roundTotal } from "../../../server/pricing/lib/engine";
import type { BaseLine, LineAdjustment } from "../../../server/pricing/lib/engine";

describe("roundTotal", () => {
  it("none: leaves the total unchanged", () => {
    expect(roundTotal(12345, "none")).toBe(12345);
  });

  it("fifty_cents: floors down to the nearest 50 cents", () => {
    expect(roundTotal(12374, "fifty_cents")).toBe(12350);
    expect(roundTotal(12350, "fifty_cents")).toBe(12350); // already exact -> unchanged
    expect(roundTotal(12399, "fifty_cents")).toBe(12350);
  });

  it("one_euro: floors down to the nearest euro, never rounds to nearest", () => {
    expect(roundTotal(12345, "one_euro")).toBe(12300);
    expect(roundTotal(12399, "one_euro")).toBe(12300); // even at .99, still floors down
    expect(roundTotal(12300, "one_euro")).toBe(12300); // already exact -> unchanged
  });
});

function line(key: string, baseAmountCents: number): BaseLine {
  return { key, label: key, targetType: "membership", baseAmountCents };
}

function adjustment(overrides: Partial<LineAdjustment> = {}): LineAdjustment {
  return { reductionCents: 0, surchargeCents: 0, fixedOverrideCents: null, ...overrides };
}

describe("applyCapAndFloorPerLine", () => {
  it("no cap configured (null): reductions pass through unscaled", () => {
    const lines = [line("membership", 15000), line("license", 3500)];
    const adjustments = {
      membership: adjustment({ reductionCents: 4500 }),
      license: adjustment(),
    };
    const { lines: result, capApplied } = applyCapAndFloorPerLine(lines, adjustments, null);
    expect(capApplied).toBe(false);
    expect(result.find((l) => l.key === "membership")?.finalAmountCents).toBe(10500);
    expect(result.find((l) => l.key === "license")?.finalAmountCents).toBe(3500);
  });

  it("cap configured but not reached: reductions pass through unscaled", () => {
    const lines = [line("membership", 15000), line("license", 0)];
    const adjustments = {
      membership: adjustment({ reductionCents: 1500 }), // 10% of 15000, well under a 50% cap
      license: adjustment(),
    };
    const { lines: result, capApplied } = applyCapAndFloorPerLine(lines, adjustments, 50);
    expect(capApplied).toBe(false);
    expect(result.find((l) => l.key === "membership")?.finalAmountCents).toBe(13500);
  });

  it("cap reached: scales reductions down so the total reduction equals exactly the cap", () => {
    const lines = [line("membership", 15000), line("license", 0)];
    const adjustments = {
      membership: adjustment({ reductionCents: 4500 }), // 30% of 15000, cap is 20%
      license: adjustment(),
    };
    const { lines: result, capApplied } = applyCapAndFloorPerLine(lines, adjustments, 20);
    expect(capApplied).toBe(true);
    expect(result.find((l) => l.key === "membership")?.finalAmountCents).toBe(12000); // 15000 - 20% = 12000
  });

  it("the license line is excluded from the cap base and from the cap's effect", () => {
    const lines = [line("membership", 10000), line("license", 3500)];
    const adjustments = {
      membership: adjustment({ reductionCents: 5000 }), // 50% of 10000, cap is 20% of 10000 (license excluded) = 2000
      license: adjustment({ reductionCents: 1000 }), // a (hypothetical) reduction on license itself
    };
    const { lines: result } = applyCapAndFloorPerLine(lines, adjustments, 20);
    expect(result.find((l) => l.key === "membership")?.finalAmountCents).toBe(8000); // 10000 - 2000
    expect(result.find((l) => l.key === "license")?.finalAmountCents).toBe(2500); // untouched by the cap: 3500 - 1000
  });

  it("cap of 0%: scales every reduction down to exactly zero (still marks capApplied)", () => {
    const lines = [line("membership", 15000), line("license", 0)];
    const adjustments = { membership: adjustment({ reductionCents: 1500 }), license: adjustment() };
    const { lines: result, capApplied } = applyCapAndFloorPerLine(lines, adjustments, 0);
    expect(capApplied).toBe(true);
    expect(result.find((l) => l.key === "membership")?.finalAmountCents).toBe(15000); // reduction fully cancelled
  });

  it("floor: a line never goes below zero even without any cap configured", () => {
    const lines = [line("additional:x", 3000)];
    const adjustments = { "additional:x": adjustment({ reductionCents: 5000 }) };
    const { lines: result } = applyCapAndFloorPerLine(lines, adjustments, null);
    expect(result[0].finalAmountCents).toBe(0);
  });

  it("a fixed override on a line takes precedence over base/surcharge/reduction", () => {
    const lines = [line("membership", 15000)];
    const adjustments = { membership: adjustment({ reductionCents: 999, surchargeCents: 999, fixedOverrideCents: 0 }) };
    const { lines: result } = applyCapAndFloorPerLine(lines, adjustments, null);
    expect(result[0].finalAmountCents).toBe(0);
  });
});

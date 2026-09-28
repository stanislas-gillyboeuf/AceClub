import { describe, expect, it } from "vitest";
import { mergePastPartnerSignals, type PartnerSignal } from "../../server/user/lib/past-partners";

const d = (iso: string) => new Date(iso);

describe("mergePastPartnerSignals", () => {
  it("keeps the most recent signal per user", () => {
    const signals: PartnerSignal[] = [
      { userId: "a", at: d("2026-01-01") },
      { userId: "a", at: d("2026-03-01") },
      { userId: "a", at: d("2026-02-01") },
    ];
    const result = mergePastPartnerSignals(signals, new Set(), 20);
    expect(result).toEqual([{ userId: "a", lastInteractionAt: d("2026-03-01") }]);
  });

  it("sorts by most recent interaction first", () => {
    const signals: PartnerSignal[] = [
      { userId: "old", at: d("2026-01-01") },
      { userId: "new", at: d("2026-06-01") },
      { userId: "mid", at: d("2026-03-01") },
    ];
    const result = mergePastPartnerSignals(signals, new Set(), 20);
    expect(result.map((p) => p.userId)).toEqual(["new", "mid", "old"]);
  });

  it("excludes blocked users entirely", () => {
    const signals: PartnerSignal[] = [
      { userId: "a", at: d("2026-01-01") },
      { userId: "blocked", at: d("2026-06-01") },
    ];
    const result = mergePastPartnerSignals(signals, new Set(["blocked"]), 20);
    expect(result.map((p) => p.userId)).toEqual(["a"]);
  });

  it("merges match and conversation signals for the same user, keeping the latest", () => {
    const signals: PartnerSignal[] = [
      { userId: "a", at: d("2026-01-01") }, // match
      { userId: "a", at: d("2026-05-01") }, // active conversation, more recent
    ];
    const result = mergePastPartnerSignals(signals, new Set(), 20);
    expect(result).toEqual([{ userId: "a", lastInteractionAt: d("2026-05-01") }]);
  });

  it("respects the limit", () => {
    const signals: PartnerSignal[] = Array.from({ length: 30 }, (_, i) => ({
      userId: `u${i}`,
      at: new Date(2026, 0, i + 1),
    }));
    const result = mergePastPartnerSignals(signals, new Set(), 20);
    expect(result).toHaveLength(20);
    // most recent 20 (u29..u10), the freshest first
    expect(result[0].userId).toBe("u29");
  });

  it("returns an empty list for no signals", () => {
    expect(mergePastPartnerSignals([], new Set(), 20)).toEqual([]);
  });
});

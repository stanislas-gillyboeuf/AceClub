import { describe, expect, it } from "vitest";
import { resolveIsNew } from "../../../server/pricing/lib/resolve-is-new";

const seasonStart = new Date("2026-09-01T00:00:00Z");

describe("resolveIsNew", () => {
  it("uses the explicit flag over the heuristic", () => {
    // Imported today (after season start) but declared an existing member.
    expect(resolveIsNew(false, new Date("2026-10-05T00:00:00Z"), seasonStart)).toBe(false);
    // Joined long ago but declared new.
    expect(resolveIsNew(true, new Date("2020-01-01T00:00:00Z"), seasonStart)).toBe(true);
  });

  it("falls back to 'joined after the season started' when the flag is not set", () => {
    expect(resolveIsNew(null, new Date("2026-10-05T00:00:00Z"), seasonStart)).toBe(true);
    expect(resolveIsNew(undefined, new Date("2025-06-01T00:00:00Z"), seasonStart)).toBe(false);
    expect(resolveIsNew(null, seasonStart, seasonStart)).toBe(true);
  });
});

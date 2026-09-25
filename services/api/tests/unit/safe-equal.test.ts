import { describe, it, expect } from "vitest";
import { safeEqual } from "../../lib/safe-equal";

describe("safeEqual", () => {
  it("matches identical secrets", () => {
    expect(safeEqual("cron-secret", "cron-secret")).toBe(true);
  });

  it("rejects a different secret of the same length", () => {
    expect(safeEqual("cron-secreT", "cron-secret")).toBe(false);
  });

  it("rejects secrets of different lengths without throwing", () => {
    expect(safeEqual("short", "a-much-longer-secret")).toBe(false);
    expect(safeEqual("a-much-longer-secret", "short")).toBe(false);
  });

  it("handles empty strings", () => {
    expect(safeEqual("", "")).toBe(true);
    expect(safeEqual("", "x")).toBe(false);
  });
});

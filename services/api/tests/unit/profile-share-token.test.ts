import { describe, expect, it } from "vitest";
import { generateShareToken } from "../../lib/profile-share-token";

describe("generateShareToken", () => {
  it("produces an opaque, URL-safe token of reasonable length", () => {
    const token = generateShareToken();
    expect(token.length).toBeGreaterThanOrEqual(24);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("is not sequential or predictable across calls", () => {
    const a = generateShareToken();
    const b = generateShareToken();
    expect(a).not.toEqual(b);
  });

  it("generates a large batch without collisions", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateShareToken()));
    expect(tokens.size).toBe(200);
  });
});

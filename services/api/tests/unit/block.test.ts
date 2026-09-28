import { describe, expect, it } from "vitest";
import { resolveBlockedUserIds } from "../../lib/block";

describe("resolveBlockedUserIds", () => {
  it("resolves the other side when the viewer is the blocker", () => {
    const result = resolveBlockedUserIds("me", [{ blockerUserId: "me", blockedUserId: "them" }]);
    expect(result).toEqual(new Set(["them"]));
  });

  it("resolves the other side when the viewer is the one blocked", () => {
    const result = resolveBlockedUserIds("me", [{ blockerUserId: "them", blockedUserId: "me" }]);
    expect(result).toEqual(new Set(["them"]));
  });

  it("merges several rows into one set", () => {
    const result = resolveBlockedUserIds("me", [
      { blockerUserId: "me", blockedUserId: "a" },
      { blockerUserId: "b", blockedUserId: "me" },
      { blockerUserId: "me", blockedUserId: "c" },
    ]);
    expect(result).toEqual(new Set(["a", "b", "c"]));
  });

  it("ignores rows that don't involve the viewer at all", () => {
    const result = resolveBlockedUserIds("me", [{ blockerUserId: "a", blockedUserId: "b" }]);
    expect(result).toEqual(new Set());
  });

  it("returns an empty set for no rows", () => {
    expect(resolveBlockedUserIds("me", [])).toEqual(new Set());
  });
});

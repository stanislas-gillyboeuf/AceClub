import { describe, expect, it } from "vitest";
import {
  canRequestIntent,
  invalidTeammateIds,
  sharesClub,
} from "../../server/match_intents/lib/visibility";

describe("sharesClub", () => {
  it("is true when two club lists overlap", () => {
    expect(sharesClub(["A", "B"], ["B", "C"])).toBe(true);
  });

  it("is false when they do not overlap", () => {
    expect(sharesClub(["A"], ["B"])).toBe(false);
  });

  it("is false for two empty lists", () => {
    expect(sharesClub([], [])).toBe(false);
  });
});

describe("invalidTeammateIds", () => {
  it("accepts a teammate who shares a club with the caller", () => {
    const found = [{ userId: "t1", isGhost: false, clubIds: ["A"] }];
    expect(invalidTeammateIds(["t1"], ["A"], found)).toEqual([]);
  });

  it("accepts a club-less ghost (a guest created from the match form)", () => {
    const found = [{ userId: "ghost1", isGhost: true, clubIds: [] }];
    expect(invalidTeammateIds(["ghost1"], ["A"], found)).toEqual([]);
  });

  it("refuses a real account of another club", () => {
    const found = [{ userId: "t1", isGhost: false, clubIds: ["B"] }];
    expect(invalidTeammateIds(["t1"], ["A"], found)).toEqual(["t1"]);
  });

  it("refuses a ghost that already belongs to another club", () => {
    const found = [{ userId: "ghost1", isGhost: true, clubIds: ["B"] }];
    expect(invalidTeammateIds(["ghost1"], ["A"], found)).toEqual(["ghost1"]);
  });

  it("refuses a teammate id that does not exist at all", () => {
    expect(invalidTeammateIds(["missing"], ["A"], [])).toEqual(["missing"]);
  });

  it("accepts a real account of another club when a direct relation already exists", () => {
    const found = [{ userId: "t1", isGhost: false, clubIds: ["B"] }];
    expect(invalidTeammateIds(["t1"], ["A"], found, new Set(["t1"]))).toEqual([]);
  });

  it("still refuses a real account of another club with no direct relation", () => {
    const found = [{ userId: "t1", isGhost: false, clubIds: ["B"] }];
    expect(invalidTeammateIds(["t1"], ["A"], found, new Set(["someone-else"]))).toEqual(["t1"]);
  });
});

describe("canRequestIntent", () => {
  it("allows a request when the requester shares a club with the owner", () => {
    expect(
      canRequestIntent({ isSuperAdmin: false, requesterClubIds: ["A"], ownerClubIds: ["A", "B"] }),
    ).toBe(true);
  });

  it("refuses a request across clubs", () => {
    expect(
      canRequestIntent({ isSuperAdmin: false, requesterClubIds: ["A"], ownerClubIds: ["B"] }),
    ).toBe(false);
  });

  it("lets the super-admin request across clubs", () => {
    expect(
      canRequestIntent({ isSuperAdmin: true, requesterClubIds: [], ownerClubIds: ["B"] }),
    ).toBe(true);
  });
});

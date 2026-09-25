import { describe, expect, it, vi } from "vitest";
import {
  canSeeEvent,
  canViewMatchPure,
  dedupeIds,
  getUserClubIdsWith,
  isSuperAdmin,
  resolveClubIdPure,
  type ClubIdsDeps,
} from "../../lib/club-access-core";

const member = { id: "u-member", role: "user" };
const outsider = { id: "u-out", role: "user" };
const superAdmin = { id: "u-admin", role: "admin" };

describe("canSeeEvent", () => {
  it("shows a public event with no club to everyone", () => {
    expect(canSeeEvent(outsider, { organizationId: null, status: "on_sale" }, { clubIds: [] })).toBe(true);
  });

  it("hides a club event from non-members, whatever its visibility", () => {
    expect(canSeeEvent(outsider, { organizationId: "A", status: "on_sale" }, { clubIds: ["B"] })).toBe(false);
  });

  it("shows a club event to its members", () => {
    expect(canSeeEvent(member, { organizationId: "A", status: "on_sale" }, { clubIds: ["A", "B"] })).toBe(true);
  });

  it("limits drafts to the club admins", () => {
    const draft = { organizationId: "A", status: "draft" };
    expect(canSeeEvent(member, draft, { clubIds: ["A"], isClubAdmin: false })).toBe(false);
    expect(canSeeEvent(member, draft, { clubIds: ["A"], isClubAdmin: true })).toBe(true);
    expect(canSeeEvent(outsider, draft, { clubIds: [], isClubAdmin: true })).toBe(false);
  });

  it("hides a draft without a club from regular users", () => {
    expect(canSeeEvent(outsider, { organizationId: null, status: "draft" }, { clubIds: [] })).toBe(false);
  });

  it("lets the super-admin see everything", () => {
    expect(canSeeEvent(superAdmin, { organizationId: "A", status: "draft" }, { clubIds: [] })).toBe(true);
    expect(isSuperAdmin(superAdmin)).toBe(true);
    expect(isSuperAdmin(member)).toBe(false);
  });
});

describe("resolveClubIdPure", () => {
  it("accepts an explicit club the user belongs to", () => {
    expect(resolveClubIdPure(member, "B", { clubIds: ["A", "B"] })).toEqual({ clubId: "B" });
  });

  it("refuses an explicit club the user does not belong to", () => {
    expect(resolveClubIdPure(member, "C", { clubIds: ["A", "B"], preferredOrgId: "A" })).toEqual({
      error: "forbidden",
    });
  });

  it("lets the super-admin scope to any club", () => {
    expect(resolveClubIdPure(superAdmin, "C", { clubIds: [] })).toEqual({ clubId: "C" });
  });

  it("falls back to the preferred club when it is still a membership", () => {
    expect(resolveClubIdPure(member, null, { clubIds: ["A", "B"], preferredOrgId: "B" })).toEqual({
      clubId: "B",
    });
  });

  it("ignores a preferred club the user no longer belongs to, then takes the first club", () => {
    expect(resolveClubIdPure(member, undefined, { clubIds: ["A", "B"], preferredOrgId: "Z" })).toEqual({
      clubId: "A",
    });
  });

  it("reports no club for a user without membership", () => {
    expect(resolveClubIdPure(outsider, null, { clubIds: [] })).toEqual({ error: "no_club" });
  });
});

describe("canViewMatchPure", () => {
  const base = {
    participantIds: ["p1", "p2"],
    participantClubIds: new Map([
      ["p1", ["A"]],
      ["p2", ["B"]],
    ]),
    hiddenFromClub: new Set<string>(),
  };

  it("shows the match to its participants", () => {
    expect(canViewMatchPure({ id: "p1" }, { ...base, viewerClubIds: [] })).toBe(true);
  });

  it("shows the match to members of a participant's club, in each participant's club", () => {
    expect(canViewMatchPure({ id: "x" }, { ...base, viewerClubIds: ["A"] })).toBe(true);
    expect(canViewMatchPure({ id: "y" }, { ...base, viewerClubIds: ["B"] })).toBe(true);
  });

  it("never shows it to a club without participant", () => {
    expect(canViewMatchPure({ id: "z" }, { ...base, viewerClubIds: ["C"] })).toBe(false);
    expect(canViewMatchPure({ id: "z" }, { ...base, viewerClubIds: [] })).toBe(false);
  });

  it("honors visibleToClub = false only for that participant's club", () => {
    const hidden = { ...base, hiddenFromClub: new Set(["p1"]) };
    expect(canViewMatchPure({ id: "x" }, { ...hidden, viewerClubIds: ["A"] })).toBe(false);
    expect(canViewMatchPure({ id: "y" }, { ...hidden, viewerClubIds: ["B"] })).toBe(true);
    expect(canViewMatchPure({ id: "p1" }, { ...hidden, viewerClubIds: [] })).toBe(true);
  });

  it("lets a participant in several clubs publish to each of them", () => {
    const multi = { ...base, participantClubIds: new Map([["p1", ["A", "C"]], ["p2", ["B"]]]) };
    expect(canViewMatchPure({ id: "x" }, { ...multi, viewerClubIds: ["C"] })).toBe(true);
  });

  it("lets the super-admin see every match", () => {
    expect(canViewMatchPure(superAdmin, { ...base, viewerClubIds: [] })).toBe(true);
  });
});

describe("getUserClubIdsWith", () => {
  const makeDeps = (cacheValue: string[] | null, dbRows: string[]) => {
    const cacheSet = vi.fn(async () => {});
    const loadFromDb = vi.fn(async () => dbRows);
    const deps: ClubIdsDeps = {
      cacheGet: vi.fn(async () => cacheValue),
      cacheSet,
      loadFromDb,
      key: (id) => `user:clubs:${id}`,
      ttlSeconds: 60,
    };
    return { deps, cacheSet, loadFromDb };
  };

  it("deduplicates duplicate member rows and caches for 60 s", async () => {
    const { deps, cacheSet, loadFromDb } = makeDeps(null, ["A", "B", "A"]);
    expect(await getUserClubIdsWith("u1", deps)).toEqual(["A", "B"]);
    expect(loadFromDb).toHaveBeenCalledTimes(1);
    expect(cacheSet).toHaveBeenCalledWith("user:clubs:u1", ["A", "B"], 60);
  });

  it("serves the cached list without touching the database", async () => {
    const { deps, loadFromDb } = makeDeps(["A"], ["Z"]);
    expect(await getUserClubIdsWith("u1", deps)).toEqual(["A"]);
    expect(loadFromDb).not.toHaveBeenCalled();
  });

  it("dedupeIds drops empties", () => {
    expect(dedupeIds(["A", "", "A", "B"])).toEqual(["A", "B"]);
  });
});

describe("invalidateUserClubIds", () => {
  it("drops the cache key of every given user, once", async () => {
    vi.resetModules();
    const cacheDel = vi.fn(async () => {});
    const cacheInvalidatePrefix = vi.fn(async () => {});
    vi.doMock("../../lib/cache", async () => {
      const actual = await vi.importActual<typeof import("../../lib/cache")>("../../lib/cache");
      return { ...actual, cacheDel, cacheInvalidatePrefix };
    });
    vi.doMock("../../db", () => ({ db: {} }));

    const access = await import("../../lib/club-access");
    await access.invalidateUserClubIds("u1", "u2", "u1", null, undefined);
    expect(cacheDel).toHaveBeenCalledTimes(2);
    expect(cacheDel).toHaveBeenCalledWith("user:clubs:u1");
    expect(cacheDel).toHaveBeenCalledWith("user:clubs:u2");

    await access.invalidateAllUserClubIds();
    expect(cacheInvalidatePrefix).toHaveBeenCalledWith("user:clubs:");

    vi.doUnmock("../../lib/cache");
    vi.doUnmock("../../db");
  });
});

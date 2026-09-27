import { describe, expect, it } from "vitest";
import { resolveLeaderboardScope } from "../../server/leaderboard/lib/scope";

const member = { id: "u1", role: "user" };
const superAdmin = { id: "u2", role: "admin" };

describe("resolveLeaderboardScope", () => {
  it("scopes to the club when organizationId is given and the caller is a member", () => {
    expect(resolveLeaderboardScope({ organizationId: "A", user: member, isMember: true })).toEqual({
      kind: "club",
      organizationId: "A",
    });
  });

  it("refuses the club ranking to a non-member", () => {
    expect(resolveLeaderboardScope({ organizationId: "A", user: member, isMember: false })).toEqual({
      kind: "forbidden",
    });
  });

  it("lets the super-admin read any club ranking", () => {
    expect(resolveLeaderboardScope({ organizationId: "A", user: superAdmin, isMember: false })).toEqual({
      kind: "club",
      organizationId: "A",
    });
  });

  it("gives the platform ranking to the super-admin with no organizationId", () => {
    expect(resolveLeaderboardScope({ user: superAdmin, isMember: false })).toEqual({ kind: "platform" });
  });

  it("refuses the platform ranking to a regular user", () => {
    expect(resolveLeaderboardScope({ user: member, isMember: false })).toEqual({ kind: "forbidden" });
  });
});

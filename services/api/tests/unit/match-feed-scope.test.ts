import { describe, expect, it } from "vitest";
import {
  canViewPlayerHistory,
  matchIdsPublishedInClub,
  resolveListScope,
} from "../../server/match/lib/feed-scope";
import { isAllowedVenue, pickVenueOrganizationId } from "../../server/match/lib/venue";
import { projectMatchUser } from "../../server/match/lib/user-projection";

describe("matchIdsPublishedInClub", () => {
  it("publishes a match with a club participant who did not hide it", () => {
    const clubParticipants = [{ matchId: "m1", userId: "u1" }];
    expect(matchIdsPublishedInClub(clubParticipants, [])).toEqual(["m1"]);
  });

  it("never publishes a match with no participant in the club", () => {
    expect(matchIdsPublishedInClub([], [])).toEqual([]);
  });

  it("hides a match whose only club participant turned visibleToClub off", () => {
    const clubParticipants = [{ matchId: "m1", userId: "u1" }];
    const hidden = [{ matchId: "m1", userId: "u1" }];
    expect(matchIdsPublishedInClub(clubParticipants, hidden)).toEqual([]);
  });

  it("still publishes if a DIFFERENT club participant kept it visible", () => {
    const clubParticipants = [
      { matchId: "m1", userId: "u1" },
      { matchId: "m1", userId: "u2" },
    ];
    const hidden = [{ matchId: "m1", userId: "u1" }];
    expect(matchIdsPublishedInClub(clubParticipants, hidden)).toEqual(["m1"]);
  });
});

describe("resolveListScope", () => {
  const viewerId = "viewer";

  it("prefers an explicit organizationId over everything else", () => {
    expect(
      resolveListScope({ organizationId: "org1", userId: "other", participantOnly: false, viewerId }),
    ).toEqual({ kind: "club", organizationId: "org1" });
  });

  it("scopes to another player when userId differs from the viewer", () => {
    expect(
      resolveListScope({ userId: "other", participantOnly: false, viewerId }),
    ).toEqual({ kind: "player", userId: "other" });
  });

  it("scopes to 'mine' when userId is the viewer", () => {
    expect(resolveListScope({ userId: viewerId, participantOnly: false, viewerId })).toEqual({
      kind: "mine",
    });
  });

  it("scopes to 'mine' when participantOnly is set and nothing else is given", () => {
    expect(resolveListScope({ participantOnly: true, viewerId })).toEqual({ kind: "mine" });
  });

  it("rejects listing the whole platform", () => {
    const result = resolveListScope({ participantOnly: false, viewerId });
    expect(result.kind).toBe("rejected");
  });
});

describe("canViewPlayerHistory", () => {
  it("always allows viewing your own history", () => {
    expect(
      canViewPlayerHistory({
        viewerId: "u1",
        targetId: "u1",
        isSuperAdmin: false,
        sharesMatch: false,
        sharesClub: false,
      }),
    ).toBe(true);
  });

  it("allows a co-participant", () => {
    expect(
      canViewPlayerHistory({
        viewerId: "u1",
        targetId: "u2",
        isSuperAdmin: false,
        sharesMatch: true,
        sharesClub: false,
      }),
    ).toBe(true);
  });

  it("allows a club mate", () => {
    expect(
      canViewPlayerHistory({
        viewerId: "u1",
        targetId: "u2",
        isSuperAdmin: false,
        sharesMatch: false,
        sharesClub: true,
      }),
    ).toBe(true);
  });

  it("refuses a stranger", () => {
    expect(
      canViewPlayerHistory({
        viewerId: "u1",
        targetId: "u2",
        isSuperAdmin: false,
        sharesMatch: false,
        sharesClub: false,
      }),
    ).toBe(false);
  });

  it("lets the super-admin see anyone", () => {
    expect(
      canViewPlayerHistory({
        viewerId: "u1",
        targetId: "u2",
        isSuperAdmin: true,
        sharesMatch: false,
        sharesClub: false,
      }),
    ).toBe(true);
  });
});

describe("pickVenueOrganizationId", () => {
  const clubsByUser = new Map([
    ["p1", ["A", "B"]],
    ["p2", ["B", "C"]],
  ]);

  it("picks the common club of both participants", () => {
    expect(
      pickVenueOrganizationId({ participantIds: ["p1", "p2"], clubsByUser, creatorId: "p1" }),
    ).toBe("B");
  });

  it("prefers the creator's preferred club when it is also common", () => {
    const clubs = new Map([
      ["p1", ["A", "B"]],
      ["p2", ["A", "B"]],
    ]);
    expect(
      pickVenueOrganizationId({
        participantIds: ["p1", "p2"],
        clubsByUser: clubs,
        creatorId: "p1",
        creatorPreferredOrgId: "B",
      }),
    ).toBe("B");
  });

  it("falls back to the creator's preferred club with no common club", () => {
    const clubs = new Map([
      ["p1", ["A"]],
      ["p2", ["C"]],
    ]);
    expect(
      pickVenueOrganizationId({
        participantIds: ["p1", "p2"],
        clubsByUser: clubs,
        creatorId: "p1",
        creatorPreferredOrgId: "A",
      }),
    ).toBe("A");
  });

  it("falls back to the creator's alphabetically first club otherwise", () => {
    const clubs = new Map([
      ["p1", ["Z", "A"]],
      ["p2", ["C"]],
    ]);
    expect(pickVenueOrganizationId({ participantIds: ["p1", "p2"], clubsByUser: clubs, creatorId: "p1" })).toBe(
      "A",
    );
  });

  it("returns null when nobody has a club", () => {
    expect(
      pickVenueOrganizationId({ participantIds: ["x", "y"], clubsByUser: new Map(), creatorId: "x" }),
    ).toBeNull();
  });
});

describe("isAllowedVenue", () => {
  const clubsByUser = new Map([["p1", ["A"]]]);

  it("allows null (no venue)", () => {
    expect(isAllowedVenue(null, ["p1", "p2"], clubsByUser)).toBe(true);
  });

  it("allows a club one participant belongs to", () => {
    expect(isAllowedVenue("A", ["p1", "p2"], clubsByUser)).toBe(true);
  });

  it("refuses a club none of the participants belong to", () => {
    expect(isAllowedVenue("Z", ["p1", "p2"], clubsByUser)).toBe(false);
  });
});

describe("projectMatchUser", () => {
  it("keeps only id, name and image", () => {
    expect(
      projectMatchUser({
        id: "u1",
        name: "Jean",
        image: "pic.jpg",
        email: "jean@example.com",
        phoneNumber: "+33612345678",
      } as never),
    ).toEqual({ id: "u1", name: "Jean", image: "pic.jpg" });
  });

  it("defaults a missing image to null", () => {
    expect(projectMatchUser({ id: "u1", name: "Jean" })).toEqual({ id: "u1", name: "Jean", image: null });
  });

  it("passes through null/undefined", () => {
    expect(projectMatchUser(null)).toBeNull();
    expect(projectMatchUser(undefined)).toBeNull();
  });
});

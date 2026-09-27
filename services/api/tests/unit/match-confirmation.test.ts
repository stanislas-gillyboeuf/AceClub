import { describe, expect, it } from "vitest";
import {
  CONFIRMATION_WINDOW_MS,
  isConfirmationExpired,
  isMatchSettledPure,
  requiresConfirmation,
} from "../../server/match/lib/confirmation";

describe("requiresConfirmation", () => {
  const base = {
    creatorClubIds: ["A"],
    participantClubIds: ["B"],
    wasSelfAdded: false,
    viaAcceptedRequest: false,
  };

  it("requires confirmation for a genuine cross-club participant added by someone else", () => {
    expect(requiresConfirmation(base)).toBe(true);
  });

  it("never requires confirmation for a self-added participant", () => {
    expect(requiresConfirmation({ ...base, wasSelfAdded: true })).toBe(false);
  });

  it("never requires confirmation when both share a club, even among several", () => {
    expect(requiresConfirmation({ ...base, creatorClubIds: ["A", "C"], participantClubIds: ["B", "C"] })).toBe(false);
  });

  it("never requires confirmation for a match born from an already-accepted partner request", () => {
    expect(requiresConfirmation({ ...base, viaAcceptedRequest: true })).toBe(false);
  });

  it("never requires confirmation when either side has no club at all", () => {
    expect(requiresConfirmation({ ...base, creatorClubIds: [] })).toBe(false);
    expect(requiresConfirmation({ ...base, participantClubIds: [] })).toBe(false);
  });

  it("requires confirmation for the exact same club ids only if they actually differ", () => {
    expect(requiresConfirmation({ ...base, creatorClubIds: ["A"], participantClubIds: ["A"] })).toBe(false);
  });
});

describe("isConfirmationExpired", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");

  it("is not expired before the 7-day window", () => {
    const now = new Date(createdAt.getTime() + CONFIRMATION_WINDOW_MS - 1000);
    expect(isConfirmationExpired(createdAt, now)).toBe(false);
  });

  it("is not expired exactly at the deadline (strictly past it only)", () => {
    const now = new Date(createdAt.getTime() + CONFIRMATION_WINDOW_MS);
    expect(isConfirmationExpired(createdAt, now)).toBe(false);
  });

  it("is expired one millisecond past the deadline", () => {
    const now = new Date(createdAt.getTime() + CONFIRMATION_WINDOW_MS + 1);
    expect(isConfirmationExpired(createdAt, now)).toBe(true);
  });
});

describe("isMatchSettledPure", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  const withinWindow = new Date(createdAt.getTime() + 1000);
  const pastWindow = new Date(createdAt.getTime() + CONFIRMATION_WINDOW_MS + 1);

  it("is not settled while a participant is pending and not yet expired", () => {
    const participants = [{ confirmedAt: new Date() }, { confirmedAt: null }];
    expect(isMatchSettledPure(participants, createdAt, withinWindow)).toBe(false);
  });

  it("is settled once every participant has confirmed", () => {
    const participants = [{ confirmedAt: new Date() }, { confirmedAt: new Date() }];
    expect(isMatchSettledPure(participants, createdAt, withinWindow)).toBe(true);
  });

  it("is settled once the window has passed, even if never confirmed — we stop waiting, we don't deny rewards", () => {
    const participants = [{ confirmedAt: new Date() }, { confirmedAt: null }];
    expect(isMatchSettledPure(participants, createdAt, pastWindow)).toBe(true);
  });

  it("is settled trivially when there is nothing to confirm", () => {
    expect(isMatchSettledPure([{ confirmedAt: new Date() }], createdAt, withinWindow)).toBe(true);
  });
});

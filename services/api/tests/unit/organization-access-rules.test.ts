import { describe, expect, it } from "vitest";
import {
  decideAddMember,
  httpStatusFromAuthError,
  isInvitationAcceptable,
  safeEqual,
  type AddMemberContext,
} from "../../server/organization/lib/access-rules";
import { checkClubPin } from "../../server/organization/lib/pin";

const base: AddMemberContext = {
  actorId: "actor",
  targetUserId: "target",
  role: "member",
  isSuperAdmin: false,
  isOrgAdmin: false,
  pinValid: false,
  orgPinRequired: false,
};

describe("decideAddMember", () => {
  it("refuses a stranger adding someone else, in any role", () => {
    expect(decideAddMember(base).allowed).toBe(false);
    expect(decideAddMember({ ...base, role: "owner" }).allowed).toBe(false);
    expect(decideAddMember({ ...base, role: ["admin"] }).allowed).toBe(false);
  });

  it("refuses a stranger adding themselves as owner or admin", () => {
    expect(decideAddMember({ ...base, targetUserId: "actor", role: "owner" }).allowed).toBe(false);
    expect(decideAddMember({ ...base, targetUserId: "actor", role: "admin" }).allowed).toBe(false);
    expect(decideAddMember({ ...base, targetUserId: "actor", role: ["member", "owner"] }).allowed).toBe(false);
  });

  it("lets a player join a club without PIN as a plain member", () => {
    expect(decideAddMember({ ...base, targetUserId: "actor" }).allowed).toBe(true);
  });

  it("requires the right PIN when the club has one", () => {
    const ctx = { ...base, targetUserId: "actor", orgPinRequired: true };
    expect(decideAddMember(ctx).allowed).toBe(false);
    expect(decideAddMember({ ...ctx, pinValid: true }).allowed).toBe(true);
  });

  it("lets club admins add members but never owners", () => {
    expect(decideAddMember({ ...base, isOrgAdmin: true }).allowed).toBe(true);
    expect(decideAddMember({ ...base, isOrgAdmin: true, role: "owner" }).allowed).toBe(false);
  });

  it("lets a platform admin do anything", () => {
    expect(decideAddMember({ ...base, isSuperAdmin: true, isOrgAdmin: true, role: "owner" }).allowed).toBe(true);
  });
});

describe("isInvitationAcceptable", () => {
  const future = new Date(Date.now() + 86_400_000);
  const inv = { email: "Player@Club.fr", status: "pending", expiresAt: future };

  it("accepts the recipient (case-insensitive)", () => {
    expect(isInvitationAcceptable(inv, "player@club.fr")).toBe(true);
  });
  it("refuses another user, a used, a cancelled, an expired or a missing invitation", () => {
    expect(isInvitationAcceptable(inv, "other@club.fr")).toBe(false);
    expect(isInvitationAcceptable({ ...inv, status: "accepted" }, "player@club.fr")).toBe(false);
    expect(isInvitationAcceptable({ ...inv, status: "canceled" }, "player@club.fr")).toBe(false);
    expect(isInvitationAcceptable({ ...inv, expiresAt: new Date(Date.now() - 1000) }, "player@club.fr")).toBe(false);
    expect(isInvitationAcceptable(undefined, "player@club.fr")).toBe(false);
  });
});

describe("safeEqual", () => {
  it("compares strings without throwing on different lengths", () => {
    expect(safeEqual("1234", "1234")).toBe(true);
    expect(safeEqual("1234", "1235")).toBe(false);
    expect(safeEqual("1234", "12345")).toBe(false);
    expect(safeEqual("", "1234")).toBe(false);
  });
});

describe("httpStatusFromAuthError", () => {
  it("maps Better Auth errors to their status", () => {
    expect(httpStatusFromAuthError({ statusCode: 403 })).toBe(403);
    expect(httpStatusFromAuthError({ status: "FORBIDDEN" })).toBe(403);
    expect(httpStatusFromAuthError({ status: "NOT_FOUND" })).toBe(404);
    expect(httpStatusFromAuthError(new Error("boom"))).toBe(500);
  });
});

describe("checkClubPin", () => {
  it("counts every attempt, blocks after 5 failures and clears on success", () => {
    const user = `u-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(checkClubPin(user, "org", "0000", "1234").status).toBe("invalid");
    expect(checkClubPin(user, "org", "1234", "1234").status).toBe("limited");

    const other = `u-${Math.random()}`;
    expect(checkClubPin(other, "org", "0000", "1234").status).toBe("invalid");
    expect(checkClubPin(other, "org", "1234", "1234").status).toBe("ok");
    // counter was reset by the success
    for (let i = 0; i < 5; i++) expect(checkClubPin(other, "org", "0000", "1234").status).toBe("invalid");
  });
});

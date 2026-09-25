import { describe, it, expect } from "vitest";
import {
  validateJoinTarget,
  validateNewBookingParticipants,
} from "../../server/court/lib/booking-rules";

describe("validateNewBookingParticipants", () => {
  it("accepts distinct participants that do not include the creator", () => {
    expect(validateNewBookingParticipants("me", ["a", "b", "c"])).toBeNull();
  });

  it("ignores guests (no userId)", () => {
    expect(validateNewBookingParticipants("me", [undefined, null, "a"])).toBeNull();
  });

  it("refuses the creator listed as a participant", () => {
    expect(validateNewBookingParticipants("me", ["a", "me"])).toBe("creator_in_participants");
  });

  it("refuses a participant listed twice", () => {
    expect(validateNewBookingParticipants("me", ["a", "b", "a"])).toBe("duplicate_participant");
  });
});

describe("validateJoinTarget", () => {
  const base = {
    callerId: "me",
    targetUserId: "me",
    bookingOwnerId: "owner",
    existingParticipantUserIds: [] as string[],
    targetIsClubMember: true,
  };

  it("lets the caller join himself", () => {
    expect(validateJoinTarget(base)).toBeNull();
  });

  it("lets a club member be added by another member", () => {
    expect(validateJoinTarget({ ...base, targetUserId: "friend" })).toBeNull();
  });

  it("refuses adding someone who is neither the caller nor a club member", () => {
    expect(
      validateJoinTarget({ ...base, targetUserId: "stranger", targetIsClubMember: false }),
    ).toBe("not_self_or_member");
  });

  it("lets the caller join himself even if the membership flag is false (checked upstream)", () => {
    expect(validateJoinTarget({ ...base, targetIsClubMember: false })).toBeNull();
  });

  it("refuses joining twice", () => {
    expect(validateJoinTarget({ ...base, existingParticipantUserIds: ["me"] })).toBe(
      "already_in_booking",
    );
  });

  it("refuses adding the booking owner (already in the booking)", () => {
    expect(validateJoinTarget({ ...base, targetUserId: "owner" })).toBe("already_in_booking");
  });

  it("does not restrict guests (no userId)", () => {
    expect(validateJoinTarget({ ...base, targetUserId: undefined })).toBeNull();
  });
});

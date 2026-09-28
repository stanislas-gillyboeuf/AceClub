import { describe, it, expect } from "vitest";
import { initialConversationStatus, canSendMessage } from "../../server/conversation/lib/request-link";

describe("initialConversationStatus", () => {
  it("starts active when both users share a club", () => {
    expect(
      initialConversationStatus({
        sameClub: true,
        sharedMatch: false,
        existingActiveConversation: false,
      }),
    ).toBe("active");
  });

  it("starts active when they share a match", () => {
    expect(
      initialConversationStatus({
        sameClub: false,
        sharedMatch: true,
        existingActiveConversation: false,
      }),
    ).toBe("active");
  });

  it("starts active when an active conversation already exists", () => {
    expect(
      initialConversationStatus({
        sameClub: false,
        sharedMatch: false,
        existingActiveConversation: true,
      }),
    ).toBe("active");
  });

  it("starts as a pending request when there is no link at all", () => {
    expect(
      initialConversationStatus({
        sameClub: false,
        sharedMatch: false,
        existingActiveConversation: false,
      }),
    ).toBe("pending_request");
  });
});

describe("canSendMessage", () => {
  const base = { status: "pending_request" as const, initiatedByUserId: "alice", senderId: "alice" };

  it("always allows sending in an active conversation", () => {
    expect(
      canSendMessage({
        status: "active",
        initiatedByUserId: "alice",
        senderId: "bob",
        initiatorHasSentMessage: true,
      }).allowed,
    ).toBe(true);
  });

  it("blocks everyone once a request was rejected", () => {
    expect(
      canSendMessage({
        status: "rejected",
        initiatedByUserId: "alice",
        senderId: "bob",
        initiatorHasSentMessage: false,
      }).allowed,
    ).toBe(false);
    expect(
      canSendMessage({
        status: "rejected",
        initiatedByUserId: "alice",
        senderId: "alice",
        initiatorHasSentMessage: false,
      }).allowed,
    ).toBe(false);
  });

  it("allows the initiator's first message while pending", () => {
    const result = canSendMessage({ ...base, initiatorHasSentMessage: false });
    expect(result.allowed).toBe(true);
  });

  it("refuses the initiator's second message while still pending", () => {
    const result = canSendMessage({ ...base, initiatorHasSentMessage: true });
    expect(result).toEqual({ allowed: false, reason: "awaiting_recipient" });
  });

  it("always allows the recipient's reply, which implicitly accepts", () => {
    const result = canSendMessage({
      status: "pending_request",
      initiatedByUserId: "alice",
      senderId: "bob",
      initiatorHasSentMessage: true,
    });
    expect(result.allowed).toBe(true);
  });

  it("allows sending when there is no recorded initiator (defensive default)", () => {
    const result = canSendMessage({
      status: "pending_request",
      initiatedByUserId: null,
      senderId: "bob",
      initiatorHasSentMessage: false,
    });
    expect(result.allowed).toBe(true);
  });
});

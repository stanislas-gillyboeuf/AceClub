/**
 * Pure rules for the "conversation request" flow: a first message between two players with no
 * prior link becomes a `pending_request` conversation instead of an ordinary one. No I/O here —
 * callers gather the booleans/ids and pass them in.
 */

export interface DirectLinkInput {
  sameClub: boolean;
  sharedMatch: boolean;
  existingActiveConversation: boolean;
}

/** Whether a new direct conversation between two users starts "active" or needs a request. */
export function initialConversationStatus(
  input: DirectLinkInput,
): "active" | "pending_request" {
  const { sameClub, sharedMatch, existingActiveConversation } = input;
  return sameClub || sharedMatch || existingActiveConversation ? "active" : "pending_request";
}

export type SendMessageDecision =
  | { allowed: true }
  | { allowed: false; reason: "awaiting_recipient" };

/**
 * Whether `senderId` may post into a conversation currently in the given status.
 * "active"/undefined statuses never restrict sending (existing behavior, untouched).
 * "rejected" blocks everyone — the request was declined.
 * "pending_request" allows exactly one message from the initiator, and always allows the
 * recipient (their message is the implicit acceptance, applied by the caller before insert).
 */
export function canSendMessage(params: {
  status: "active" | "pending_request" | "rejected";
  initiatedByUserId: string | null;
  senderId: string;
  /** Has the initiator already sent their one allowed message in this conversation? */
  initiatorHasSentMessage: boolean;
}): SendMessageDecision {
  const { status, initiatedByUserId, senderId, initiatorHasSentMessage } = params;
  if (status === "active") return { allowed: true };
  if (status === "rejected") return { allowed: false, reason: "awaiting_recipient" };
  // pending_request
  if (initiatedByUserId === null || senderId !== initiatedByUserId) {
    // The recipient (or an unexpected sender) replying — implicit acceptance, always allowed.
    return { allowed: true };
  }
  // The initiator gets exactly one message while the request is unanswered.
  if (initiatorHasSentMessage) {
    return { allowed: false, reason: "awaiting_recipient" };
  }
  return { allowed: true };
}

// Pure booking participant rules (no I/O) so they can be unit-tested and shared by the handlers.

export type ParticipantRuleError = "duplicate_participant" | "creator_in_participants";

/** Registered participants of a new booking: no duplicate userId, and the creator is not listed. */
export function validateNewBookingParticipants(
  creatorId: string,
  participantUserIds: Array<string | null | undefined>,
): ParticipantRuleError | null {
  const seen = new Set<string>();
  for (const id of participantUserIds) {
    if (!id) continue;
    if (id === creatorId) return "creator_in_participants";
    if (seen.has(id)) return "duplicate_participant";
    seen.add(id);
  }
  return null;
}

export type JoinTargetError = "not_self_or_member" | "already_in_booking";

interface JoinTargetInput {
  callerId: string;
  targetUserId: string | null | undefined;
  bookingOwnerId: string;
  existingParticipantUserIds: Array<string | null | undefined>;
  targetIsClubMember: boolean;
}

/**
 * Who can be added to a booking's team: the caller himself, or another member of the club (guests
 * carry no userId and are unrestricted). A person can only be in the booking once, owner included.
 */
export function validateJoinTarget({
  callerId,
  targetUserId,
  bookingOwnerId,
  existingParticipantUserIds,
  targetIsClubMember,
}: JoinTargetInput): JoinTargetError | null {
  if (!targetUserId) return null;
  if (targetUserId !== callerId && !targetIsClubMember) return "not_self_or_member";
  if (targetUserId === bookingOwnerId) return "already_in_booking";
  if (existingParticipantUserIds.includes(targetUserId)) return "already_in_booking";
  return null;
}

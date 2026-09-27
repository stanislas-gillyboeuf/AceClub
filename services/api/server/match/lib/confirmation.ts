export interface RequiresConfirmationInput {
  creatorClubIds: readonly string[];
  participantClubIds: readonly string[];
  wasSelfAdded: boolean;
  viaAcceptedRequest: boolean;
}

/**
 * A participant must explicitly confirm only when someone else added them AND they share no club
 * with the match's creator at creation time. Self-added participants and matches born from an
 * already-mutually-accepted partner request (`match_intents/mutations/accept-request.ts`) carry
 * consent by construction — never require confirmation. A participant with no club at all can't be
 * "cross-club" from anyone, so they never require confirmation either.
 */
export function requiresConfirmation(input: RequiresConfirmationInput): boolean {
  if (input.wasSelfAdded || input.viaAcceptedRequest) return false;
  if (input.creatorClubIds.length === 0 || input.participantClubIds.length === 0) return false;
  const sharesClub = input.creatorClubIds.some((id) => input.participantClubIds.includes(id));
  return !sharesClub;
}

export const CONFIRMATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Computed at read time, never by a cron. Strictly past the deadline — equal to it is not expired. */
export function isConfirmationExpired(matchCreatedAt: Date, now: Date): boolean {
  return now.getTime() - matchCreatedAt.getTime() > CONFIRMATION_WINDOW_MS;
}

export interface ParticipantConfirmationState {
  confirmedAt: Date | null;
}

/**
 * A match's rewards can be settled once every participant has either confirmed, or their window
 * has expired — we stop waiting on them. Expiry only ever blocks club-feed publication
 * (`lib/club-access-core.ts` `canViewMatchPure`), never a player's own Aces: once we give up
 * waiting, the match is finalized as participant-only forever, but the people who actually played
 * still get their rewards.
 */
export function isMatchSettledPure(
  participants: readonly ParticipantConfirmationState[],
  matchCreatedAt: Date,
  now: Date,
): boolean {
  return participants.every((p) => p.confirmedAt !== null || isConfirmationExpired(matchCreatedAt, now));
}

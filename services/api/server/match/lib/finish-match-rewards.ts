import { eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { matchParticipant } from "../../../db/schema/match/schema";
import { member } from "../../../db/schema/auth/schema";
import { attributeMatchAces, hasAttributedAces } from "../../level/services/xp-attribution";
import { updateUserStreak } from "../../streak/services/streak-manager";
import { updateChallengeProgress } from "../../challenge/services/progress-tracker";
import { checkBadges } from "../../reward/services/badge-checker";
import { cacheDel, cacheInvalidatePrefix, CacheKeys } from "../../../lib/cache";

/**
 * Aces, streak, challenge progress, badges and cache invalidation for a finished match — the one
 * place this runs, whether triggered right when the match finishes (everyone already confirmed) or
 * later, once a deferred cross-club confirmation settles (`mutations/confirm-match.ts`,
 * `queries/get-match.ts`'s lazy settle-on-read). Guarded by `hasAttributedAces` so calling it twice
 * for the same match is a no-op.
 */
export async function applyMatchFinishRewards(matchId: string): Promise<void> {
  if (await hasAttributedAces(matchId)) return;

  const participants = await db
    .select()
    .from(matchParticipant)
    .where(eq(matchParticipant.matchId, matchId));

  for (const participant of participants) {
    const { multiplier } = await updateUserStreak(participant.userId, new Date());
    await attributeMatchAces(matchId, [participant], multiplier);
    await updateChallengeProgress(participant.userId, matchId, participant.isWinner);
    await checkBadges(participant.userId);
  }

  const participantUserIds = participants.map((p) => p.userId);
  await Promise.all([
    cacheInvalidatePrefix(CacheKeys.PREFIX_LEADERBOARD_GLOBAL),
    cacheInvalidatePrefix(CacheKeys.PREFIX_LEADERBOARD_WEEKLY),
    ...participantUserIds.map((uid) => cacheDel(CacheKeys.userMe(uid))),
  ]);

  if (participantUserIds.length > 0) {
    const orgMemberships = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(inArray(member.userId, participantUserIds));

    const orgIds = [...new Set(orgMemberships.map((m) => m.organizationId))];
    await Promise.all(
      orgIds.flatMap((orgId) => [
        cacheDel(CacheKeys.orgStats(orgId)),
        cacheInvalidatePrefix(CacheKeys.prefixLeaderboardOrg(orgId)),
      ]),
    );
  }
}

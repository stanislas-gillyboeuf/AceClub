import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "../../../lib/club-access";
import { isConfirmationExpired, isMatchSettledPure } from "../lib/confirmation";
import { applyMatchFinishRewards } from "../lib/finish-match-rewards";

/**
 * A cross-club participant confirms their own row on the match. Idempotent (already confirmed
 * succeeds again); refuses past the 7-day window (`isConfirmationExpired`) — the match then stays
 * participant-only forever, but never blocks the confirmer's own Aces (see confirmation.ts).
 */
export const confirmMatch = async (c: Context<HonoContext>) => {
  const matchId = c.req.param("id");
  const currentUser = c.get("user")!;

  const [foundMatch] = await db.select().from(match).where(eq(match.id, matchId)).limit(1);
  if (!foundMatch) return notFound(c);

  // Same 404 as get-match/toggle-like for "not yours": never reveal a match by its id, and this
  // route only ever confirms the caller's OWN participant row, never someone else's.
  const [participant] = await db
    .select()
    .from(matchParticipant)
    .where(and(eq(matchParticipant.matchId, matchId), eq(matchParticipant.userId, currentUser.id)))
    .limit(1);
  if (!participant) return notFound(c);

  const now = new Date();

  if (participant.confirmedAt) {
    return c.json({ success: true, confirmedAt: participant.confirmedAt.toISOString(), alreadyConfirmed: true });
  }

  if (isConfirmationExpired(foundMatch.createdAt, now)) {
    return c.json(
      {
        error: "Expired",
        message: "The confirmation window for this match has expired; it remains visible to its participants only.",
      },
      400,
    );
  }

  const [updated] = await db
    .update(matchParticipant)
    .set({ confirmedAt: now })
    .where(eq(matchParticipant.id, participant.id))
    .returning();

  if (foundMatch.status === "finished") {
    try {
      const allParticipants = await db
        .select()
        .from(matchParticipant)
        .where(eq(matchParticipant.matchId, matchId));
      if (isMatchSettledPure(allParticipants, foundMatch.createdAt, now)) {
        await applyMatchFinishRewards(matchId);
      }
    } catch (acesError) {
      console.error("Error attributing Aces after confirmation:", acesError);
    }
  }

  return c.json({ success: true, confirmedAt: updated.confirmedAt!.toISOString(), alreadyConfirmed: false });
};

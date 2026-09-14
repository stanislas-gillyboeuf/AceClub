import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { tournament, tournamentMatch } from "../../../db/schema";

export function totalRounds(drawSize: number): number {
  return Math.round(Math.log2(drawSize));
}

type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Pushes a known winner into the parent round-slot it feeds — round R position P always
 * feeds round R+1 position floor(P/2), player1 if P is even, player2 if P is odd. Once the
 * parent match has both players it becomes "ready". If there is no parent (round === the
 * final), the tournament itself is marked completed instead.
 *
 * Round >= 2 matches can only ever end up "pending" (0-1 known) or "ready" (2 known) — never
 * "bye": byes only exist in round 1, where a slot has no seed at all. A round-2+ slot is
 * always filled by a real propagated winner, so both its players are non-null once known.
 *
 * Does NOT touch the source match's own row — callers (bracket generation for byes, or
 * record-match-winner for a played match) own setting the source match's own status/winner.
 */
export async function propagateWinner(
  tx: DbOrTx,
  params: { tournamentId: string; drawSize: number; round: number; position: number; winnerUserId: string },
): Promise<void> {
  const rounds = totalRounds(params.drawSize);
  if (params.round >= rounds) {
    await tx.update(tournament).set({ status: "completed" }).where(eq(tournament.id, params.tournamentId));
    return;
  }

  const parentRound = params.round + 1;
  const parentPosition = Math.floor(params.position / 2);
  const isPlayer1Slot = params.position % 2 === 0;

  await tx
    .update(tournamentMatch)
    .set(isPlayer1Slot ? { player1UserId: params.winnerUserId } : { player2UserId: params.winnerUserId })
    .where(
      and(
        eq(tournamentMatch.tournamentId, params.tournamentId),
        eq(tournamentMatch.round, parentRound),
        eq(tournamentMatch.position, parentPosition),
      ),
    );

  const [parent] = await tx
    .select({ player1UserId: tournamentMatch.player1UserId, player2UserId: tournamentMatch.player2UserId })
    .from(tournamentMatch)
    .where(
      and(
        eq(tournamentMatch.tournamentId, params.tournamentId),
        eq(tournamentMatch.round, parentRound),
        eq(tournamentMatch.position, parentPosition),
      ),
    )
    .limit(1);

  if (parent?.player1UserId && parent?.player2UserId) {
    await tx
      .update(tournamentMatch)
      .set({ status: "ready" })
      .where(
        and(
          eq(tournamentMatch.tournamentId, params.tournamentId),
          eq(tournamentMatch.round, parentRound),
          eq(tournamentMatch.position, parentPosition),
        ),
      );
  }
}

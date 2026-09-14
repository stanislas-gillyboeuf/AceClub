import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentMatch } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { totalRounds } from "../lib/bracket";
import { resetMatchValidator } from "../validators";

export const resetMatch = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof resetMatchValidator>;

  const [match] = await db
    .select()
    .from(tournamentMatch)
    .where(eq(tournamentMatch.id, validated.tournamentMatchId))
    .limit(1);

  if (!match) {
    return c.json({ error: "NotFound", message: "Match not found" }, 404);
  }

  const [parentTournament] = await db
    .select()
    .from(tournament)
    .where(eq(tournament.id, match.tournamentId))
    .limit(1);

  if (!parentTournament) {
    return c.json({ error: "NotFound", message: "Tournament not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, parentTournament.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (match.status === "bye") {
    return c.json({ error: "BadRequest", message: "A bye can't be reset" }, 400);
  }
  if (match.status !== "completed") {
    return c.json({ error: "BadRequest", message: "This match has no result to reset" }, 400);
  }

  const rounds = totalRounds(parentTournament.drawSize);
  const isFinal = match.round >= rounds;

  if (!isFinal) {
    const parentRound = match.round + 1;
    const parentPosition = Math.floor(match.position / 2);

    const [parent] = await db
      .select({ status: tournamentMatch.status })
      .from(tournamentMatch)
      .where(
        and(
          eq(tournamentMatch.tournamentId, match.tournamentId),
          eq(tournamentMatch.round, parentRound),
          eq(tournamentMatch.position, parentPosition),
        ),
      )
      .limit(1);

    if (parent?.status === "completed") {
      return c.json(
        { error: "BadRequest", message: "Reset the next round's result first" },
        400,
      );
    }

    const isPlayer1Slot = match.position % 2 === 0;

    await db.transaction(async (tx) => {
      await tx
        .update(tournamentMatch)
        .set({ winnerUserId: null, status: "ready" })
        .where(eq(tournamentMatch.id, match.id));

      await tx
        .update(tournamentMatch)
        .set(isPlayer1Slot ? { player1UserId: null } : { player2UserId: null })
        .where(
          and(
            eq(tournamentMatch.tournamentId, match.tournamentId),
            eq(tournamentMatch.round, parentRound),
            eq(tournamentMatch.position, parentPosition),
          ),
        );

      await tx
        .update(tournamentMatch)
        .set({ status: "pending" })
        .where(
          and(
            eq(tournamentMatch.tournamentId, match.tournamentId),
            eq(tournamentMatch.round, parentRound),
            eq(tournamentMatch.position, parentPosition),
          ),
        );
    });
  } else {
    await db.transaction(async (tx) => {
      await tx
        .update(tournamentMatch)
        .set({ winnerUserId: null, status: "ready" })
        .where(eq(tournamentMatch.id, match.id));

      await tx
        .update(tournament)
        .set({ status: "in_progress" })
        .where(eq(tournament.id, parentTournament.id));
    });
  }

  return c.json({ success: true });
};

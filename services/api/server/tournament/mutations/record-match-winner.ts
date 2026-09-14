import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentMatch } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { propagateWinner } from "../lib/bracket";
import { recordMatchWinnerValidator } from "../validators";

export const recordMatchWinner = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof recordMatchWinnerValidator>;

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

  if (match.status !== "ready") {
    return c.json(
      { error: "BadRequest", message: "This match doesn't have two confirmed players yet" },
      400,
    );
  }

  if (validated.winnerUserId !== match.player1UserId && validated.winnerUserId !== match.player2UserId) {
    return c.json({ error: "BadRequest", message: "Winner must be one of the two players" }, 400);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(tournamentMatch)
      .set({ winnerUserId: validated.winnerUserId, status: "completed" })
      .where(eq(tournamentMatch.id, match.id));

    await propagateWinner(tx, {
      tournamentId: match.tournamentId,
      drawSize: parentTournament.drawSize,
      round: match.round,
      position: match.position,
      winnerUserId: validated.winnerUserId,
    });
  });

  return c.json({ success: true });
};

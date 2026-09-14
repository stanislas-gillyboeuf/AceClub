import { Context } from "hono";
import { z } from "zod";
import { alias } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { event, tournament, tournamentMatch, tournamentSeed, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { getTournamentValidator } from "../validators";

const player1 = alias(user, "player1");
const player2 = alias(user, "player2");
const winner = alias(user, "winner");

export const getTournament = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getTournamentValidator>;

  const [row] = await db
    .select({
      id: tournament.id,
      eventId: tournament.eventId,
      organizationId: tournament.organizationId,
      sport: tournament.sport,
      format: tournament.format,
      drawSize: tournament.drawSize,
      status: tournament.status,
      eventName: event.name,
      eventDescription: event.description,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
      eventStatus: event.status,
    })
    .from(tournament)
    .innerJoin(event, eq(tournament.eventId, event.id))
    .where(eq(tournament.id, validated.tournamentId))
    .limit(1);

  if (!row) {
    return c.json({ error: "NotFound", message: "Tournament not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, row.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [seeds, matches] = await Promise.all([
    db
      .select({
        userId: tournamentSeed.userId,
        seedNumber: tournamentSeed.seedNumber,
        skillLevel: tournamentSeed.skillLevel,
        name: user.name,
        image: user.image,
      })
      .from(tournamentSeed)
      .innerJoin(user, eq(tournamentSeed.userId, user.id))
      .where(eq(tournamentSeed.tournamentId, validated.tournamentId))
      .orderBy(asc(tournamentSeed.seedNumber)),
    db
      .select({
        id: tournamentMatch.id,
        round: tournamentMatch.round,
        position: tournamentMatch.position,
        status: tournamentMatch.status,
        player1UserId: tournamentMatch.player1UserId,
        player2UserId: tournamentMatch.player2UserId,
        winnerUserId: tournamentMatch.winnerUserId,
        player1Name: player1.name,
        player2Name: player2.name,
        winnerName: winner.name,
      })
      .from(tournamentMatch)
      .leftJoin(player1, eq(tournamentMatch.player1UserId, player1.id))
      .leftJoin(player2, eq(tournamentMatch.player2UserId, player2.id))
      .leftJoin(winner, eq(tournamentMatch.winnerUserId, winner.id))
      .where(eq(tournamentMatch.tournamentId, validated.tournamentId))
      .orderBy(asc(tournamentMatch.round), asc(tournamentMatch.position)),
  ]);

  return c.json({ ...row, seeds, matches });
};

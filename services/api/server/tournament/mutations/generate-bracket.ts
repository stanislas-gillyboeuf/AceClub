import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentMatch, tournamentSeed } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { propagateWinner, totalRounds } from "../lib/bracket";
import { computeSeedOrder } from "../lib/seed-placement";
import { generateBracketValidator } from "../validators";

export const generateBracket = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof generateBracketValidator>;

  const [existing] = await db
    .select()
    .from(tournament)
    .where(eq(tournament.id, validated.tournamentId))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Tournament not found" }, 404);
  }

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, existing.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (existing.status !== "draft") {
    return c.json({ error: "BadRequest", message: "The bracket has already been generated" }, 400);
  }

  const seeds = await db
    .select()
    .from(tournamentSeed)
    .where(eq(tournamentSeed.tournamentId, validated.tournamentId))
    .orderBy(asc(tournamentSeed.seedNumber));

  if (seeds.length < 2) {
    return c.json({ error: "BadRequest", message: "At least 2 seeded players are required" }, 400);
  }
  if (seeds.length > existing.drawSize) {
    return c.json(
      { error: "BadRequest", message: `Too many seeded players for a draw of ${existing.drawSize}` },
      400,
    );
  }

  const seedOrder = computeSeedOrder(existing.drawSize);
  const userIdBySeedNumber = new Map(seeds.map((s) => [s.seedNumber, s.userId]));
  const slotUserIds = seedOrder.map((seedNumber) => userIdBySeedNumber.get(seedNumber) ?? null);

  const rounds = totalRounds(existing.drawSize);

  await db.transaction(async (tx) => {
    // Round 1 — real or bye matches from the seeded slots.
    const round1Matches = existing.drawSize / 2;
    const byes: { position: number; winnerUserId: string }[] = [];

    for (let k = 0; k < round1Matches; k++) {
      const player1 = slotUserIds[2 * k];
      const player2 = slotUserIds[2 * k + 1];

      if (player1 && player2) {
        await tx.insert(tournamentMatch).values({
          tournamentId: existing.id,
          round: 1,
          position: k,
          player1UserId: player1,
          player2UserId: player2,
          status: "ready",
        });
      } else if (player1 || player2) {
        const winnerUserId = (player1 ?? player2)!;
        await tx.insert(tournamentMatch).values({
          tournamentId: existing.id,
          round: 1,
          position: k,
          player1UserId: player1,
          player2UserId: player2,
          winnerUserId,
          status: "bye",
        });
        byes.push({ position: k, winnerUserId });
      } else {
        // Cannot happen given drawSize is chosen so byes < drawSize/2 (see seed-placement.ts),
        // but insert a harmless empty placeholder rather than crash if it ever does.
        await tx.insert(tournamentMatch).values({
          tournamentId: existing.id,
          round: 1,
          position: k,
          status: "pending",
        });
      }
    }

    // Rounds 2..N — empty placeholders, filled in as earlier rounds complete.
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = existing.drawSize / 2 ** round;
      for (let position = 0; position < matchesInRound; position++) {
        await tx.insert(tournamentMatch).values({
          tournamentId: existing.id,
          round,
          position,
          status: "pending",
        });
      }
    }

    for (const bye of byes) {
      await propagateWinner(tx, {
        tournamentId: existing.id,
        drawSize: existing.drawSize,
        round: 1,
        position: bye.position,
        winnerUserId: bye.winnerUserId,
      });
    }

    await tx.update(tournament).set({ status: "in_progress" }).where(eq(tournament.id, existing.id));
  });

  return c.json({ success: true });
};

import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentSeed } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { updateSeedNumberValidator } from "../validators";

export const updateSeedNumber = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateSeedNumberValidator>;

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
    return c.json(
      { error: "BadRequest", message: "Seeds can only be changed before the bracket is generated" },
      400,
    );
  }

  const [seedRow] = await db
    .select()
    .from(tournamentSeed)
    .where(
      and(
        eq(tournamentSeed.tournamentId, validated.tournamentId),
        eq(tournamentSeed.userId, validated.userId),
      ),
    )
    .limit(1);

  if (!seedRow) {
    return c.json({ error: "NotFound", message: "This player is not seeded" }, 404);
  }

  await db.transaction(async (tx) => {
    const [conflicting] = await tx
      .select()
      .from(tournamentSeed)
      .where(
        and(
          eq(tournamentSeed.tournamentId, validated.tournamentId),
          eq(tournamentSeed.seedNumber, validated.seedNumber),
        ),
      )
      .limit(1);

    if (conflicting && conflicting.userId !== validated.userId) {
      // Swap — move the conflicting player out of the way first (temp value) to dodge the
      // unique (tournamentId, seedNumber) constraint mid-transaction.
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: -1 })
        .where(eq(tournamentSeed.id, conflicting.id));
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: validated.seedNumber })
        .where(eq(tournamentSeed.id, seedRow.id));
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: seedRow.seedNumber })
        .where(eq(tournamentSeed.id, conflicting.id));
    } else {
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: validated.seedNumber })
        .where(eq(tournamentSeed.id, seedRow.id));
    }
  });

  return c.json({ success: true });
};

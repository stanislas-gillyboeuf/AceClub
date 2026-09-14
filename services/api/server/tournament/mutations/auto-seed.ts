import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentSeed } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { compareSkillLevelDesc } from "../lib/skill-order";
import { autoSeedValidator } from "../validators";

// Re-numbers every current seed by skill level, strongest = seed 1 — the "Trier par niveau"
// button. Admins can still hand-tweak individual numbers afterwards via update-seed-number.
export const autoSeed = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof autoSeedValidator>;

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

  const seeds = await db
    .select()
    .from(tournamentSeed)
    .where(eq(tournamentSeed.tournamentId, validated.tournamentId));

  const sorted = [...seeds].sort((a, b) =>
    compareSkillLevelDesc(existing.sport, a.skillLevel, b.skillLevel),
  );

  await db.transaction(async (tx) => {
    // Two passes to dodge the unique (tournamentId, seedNumber) constraint while reassigning.
    for (let i = 0; i < sorted.length; i++) {
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: -(i + 1) })
        .where(eq(tournamentSeed.id, sorted[i].id));
    }
    for (let i = 0; i < sorted.length; i++) {
      await tx
        .update(tournamentSeed)
        .set({ seedNumber: i + 1 })
        .where(eq(tournamentSeed.id, sorted[i].id));
    }
  });

  return c.json({ success: true });
};

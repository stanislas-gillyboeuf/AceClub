import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteTournamentValidator } from "../validators";

// Only allowed before the bracket exists — keeps the underlying event intact, manageable via
// the regular event endpoints (cancel/delete) separately if the whole thing needs to go away.
export const deleteTournament = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteTournamentValidator>;

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
      { error: "BadRequest", message: "The bracket has already been generated — delete the event instead if needed" },
      400,
    );
  }

  await db.delete(tournament).where(eq(tournament.id, existing.id));

  return c.json({ success: true });
};

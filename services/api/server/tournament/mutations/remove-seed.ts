import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentSeed } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { removeSeedValidator } from "../validators";

export const removeSeed = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof removeSeedValidator>;

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
      { error: "BadRequest", message: "Players can only be removed before the bracket is generated" },
      400,
    );
  }

  await db
    .delete(tournamentSeed)
    .where(
      and(eq(tournamentSeed.tournamentId, validated.tournamentId), eq(tournamentSeed.userId, validated.userId)),
    );

  return c.json({ success: true });
};

import { Context } from "hono";
import { z } from "zod";
import { eq, max } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { tournament, tournamentSeed, userPreference } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { addSeedValidator } from "../validators";

export const addSeed = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addSeedValidator>;

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
      { error: "BadRequest", message: "Players can only be seeded before the bracket is generated" },
      400,
    );
  }

  const memberExists = await isOrgMember(validated.userId, existing.organizationId);
  if (!memberExists) {
    return c.json({ error: "BadRequest", message: "This user is not a member of this club" }, 400);
  }

  const [preference] = await db
    .select({
      sport: userPreference.sport,
      skillLevel: userPreference.skillLevel,
      secondarySport: userPreference.secondarySport,
      secondarySkillLevel: userPreference.secondarySkillLevel,
    })
    .from(userPreference)
    .where(eq(userPreference.userId, validated.userId))
    .limit(1);

  const skillLevel =
    preference?.sport === existing.sport
      ? preference.skillLevel
      : preference?.secondarySport === existing.sport
        ? preference.secondarySkillLevel
        : null;

  const [maxSeedResult] = await db
    .select({ max: max(tournamentSeed.seedNumber) })
    .from(tournamentSeed)
    .where(eq(tournamentSeed.tournamentId, validated.tournamentId));

  try {
    const [created] = await db
      .insert(tournamentSeed)
      .values({
        tournamentId: validated.tournamentId,
        userId: validated.userId,
        seedNumber: (maxSeedResult?.max ?? 0) + 1,
        skillLevel: skillLevel ?? null,
      })
      .returning();
    return c.json(created, 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "23505") {
      return c.json({ error: "Conflict", message: "This player is already seeded" }, 409);
    }
    throw error;
  }
};

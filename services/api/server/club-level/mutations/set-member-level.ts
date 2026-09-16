import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubLevelCategory, userPreference } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isBuiltinLevel } from "../lib/builtin-levels";
import { setMemberLevelValidator } from "../validators";

export const setMemberLevel = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof setMemberLevelValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  let isValid = isBuiltinLevel(validated.sport, validated.skillLevel);
  if (!isValid) {
    const [category] = await db
      .select({ id: clubLevelCategory.id })
      .from(clubLevelCategory)
      .where(
        and(
          eq(clubLevelCategory.organizationId, validated.organizationId),
          eq(clubLevelCategory.sport, validated.sport),
          eq(clubLevelCategory.name, validated.skillLevel),
        ),
      )
      .limit(1);
    isValid = !!category;
  }

  if (!isValid) {
    return c.json({ error: "BadRequest", message: "Unknown skill level for this club/sport" }, 400);
  }

  const verifiedFields = validated.verified
    ? { skillLevelVerified: true, skillLevelVerifiedByUserId: currentUser.id, skillLevelVerifiedAt: new Date() }
    : { skillLevelVerified: false, skillLevelVerifiedByUserId: null, skillLevelVerifiedAt: null };

  const [updated] = await db
    .insert(userPreference)
    .values({
      userId: validated.userId,
      organizationId: validated.organizationId,
      sport: validated.sport,
      skillLevel: validated.skillLevel,
      ...verifiedFields,
    })
    .onConflictDoUpdate({
      target: userPreference.userId,
      set: {
        organizationId: validated.organizationId,
        sport: validated.sport,
        skillLevel: validated.skillLevel,
        ...verifiedFields,
      },
    })
    .returning();

  return c.json(updated);
};

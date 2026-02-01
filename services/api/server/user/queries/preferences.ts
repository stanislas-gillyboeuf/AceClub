import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { organization } from "../../../db/schema/auth/schema";

export const getPreferences = async (c: Context<HonoContext>) => {
  const authUser = c.get("user");

  const [pref] = await db
    .select({
      id: userPreference.id,
      userId: userPreference.userId,
      organizationId: userPreference.organizationId,
      organizationName: organization.name,
      sport: userPreference.sport,
      skillLevel: userPreference.skillLevel,
      createdAt: userPreference.createdAt,
      updatedAt: userPreference.updatedAt,
    })
    .from(userPreference)
    .leftJoin(organization, eq(userPreference.organizationId, organization.id))
    .where(eq(userPreference.userId, authUser!.id))
    .limit(1);

  if (!pref) {
    return c.json(
      {
        error: "Not found",
        message: "User preferences not found",
      },
      404,
    );
  }

  return c.json({
    id: pref.id,
    userId: pref.userId,
    organizationId: pref.organizationId,
    organizationName: pref.organizationName,
    sport: pref.sport,
    skillLevel: pref.skillLevel,
    createdAt: pref.createdAt,
    updatedAt: pref.updatedAt,
  });
};

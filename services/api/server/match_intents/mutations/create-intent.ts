import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createMatchIntentValidator } from "../validators";
import { db } from "../../../db";
import { matchIntent, matchIntentTeammate } from "../../../db/schema/match_intents/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { eq } from "drizzle-orm";

export const createMatchIntent = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createMatchIntentValidator>;
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    let dateObj: Date | null = null;
    if (!validated.isFlexibleDate) {
      dateObj = new Date(`${validated.date}T${validated.time}:00`);
      if (isNaN(dateObj.getTime())) {
        return c.json({ error: "Invalid date or time format" }, 400);
      }
    }

    const teammateUserIds = [...new Set(validated.teammateUserIds)].filter((id) => id !== userId);
    if (teammateUserIds.length !== validated.teammateUserIds.length) {
      return c.json({ error: "BadRequest", message: "Invalid teammates list" }, 400);
    }

    const [preference] = await db
      .select({ sport: userPreference.sport })
      .from(userPreference)
      .where(eq(userPreference.userId, userId))
      .limit(1);

    const [createdMatchIntent] = await db
      .insert(matchIntent)
      .values({
        userId: userId,
        date: dateObj,
        time: dateObj,
        isFlexibleDate: validated.isFlexibleDate,
        duration: validated.duration,
        type: validated.type,
        description: validated.description,
      })
      .returning();

    if (teammateUserIds.length > 0 && preference?.sport === "padel") {
      await db.insert(matchIntentTeammate).values(
        teammateUserIds.map((teammateUserId, index) => ({
          matchIntentId: createdMatchIntent.id,
          slotIndex: index,
          userId: teammateUserId,
        })),
      );
    }

    return c.json(createdMatchIntent, 201);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [CREATE MATCH INTENT] Error message:", errorMessage);
    if (errorMessage.includes("foreign key constraint")) {
      console.error("💥 [CREATE MATCH INTENT] Foreign key constraint violation");
      return c.json({ error: "Invalid reference" }, 400);
    }
    if (errorMessage.includes("unique constraint")) {
      console.error("💥 [CREATE MATCH INTENT] Unique constraint violation");
      return c.json({ error: "Duplicate entry" }, 409);
    }
    return c.json({ error: (error as Error).message }, 500);
  }
};

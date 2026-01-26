import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createMatchIntentValidator } from "../validators";
import { db } from "../../../db";
import { matchIntent } from "../../../db/schema/match_intents/schema";

export const createMatchIntent = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof createMatchIntentValidator>;
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }
    const [createdMatchIntent] = await db.insert(matchIntent).values({
      userId: userId,
      date: new Date(validated.date),
      time: new Date(validated.time),
      duration: validated.duration,
    }).returning();

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
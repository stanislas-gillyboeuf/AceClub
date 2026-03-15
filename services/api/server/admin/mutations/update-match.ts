import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateMatchAdminValidator } from "../validators";
import { db } from "../../../db";
import { match } from "../../../db/schema/match/schema";
import { eq } from "drizzle-orm";

export const updateMatchAdmin = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateMatchAdminValidator>;

    const [existing] = await db
      .select()
      .from(match)
      .where(eq(match.id, validated.matchId))
      .limit(1);

    if (!existing) {
      return c.json({ error: "NotFound", message: "Match not found" }, 404);
    }

    const [updated] = await db
      .update(match)
      .set({ scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null })
      .where(eq(match.id, validated.matchId))
      .returning();

    return c.json({ success: true, match: updated });
  } catch (error) {
    return c.json({ error: "Internal server error", message: (error as Error).message }, 500);
  }
};

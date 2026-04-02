import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate } from "../../../db/schema/challenge/schema";
import { eq } from "drizzle-orm";

export const deleteChallengeTemplate = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(challengeTemplate)
    .where(eq(challengeTemplate.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Challenge template not found" }, 404);
  }

  await db
    .update(challengeTemplate)
    .set({ isActive: false })
    .where(eq(challengeTemplate.id, id));

  return c.json({ success: true });
};

import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate } from "../../../db/schema/challenge/schema";
import { eq } from "drizzle-orm";
import { updateChallengeTemplateValidator } from "../validators";
import { z } from "zod";

export const updateChallengeTemplate = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateChallengeTemplateValidator>;

  const [existing] = await db
    .select()
    .from(challengeTemplate)
    .where(eq(challengeTemplate.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Challenge template not found" }, 404);
  }

  const [updated] = await db
    .update(challengeTemplate)
    .set(validated)
    .where(eq(challengeTemplate.id, id))
    .returning();

  return c.json(updated);
};

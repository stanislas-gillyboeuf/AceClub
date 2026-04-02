import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate } from "../../../db/schema/challenge/schema";
import { createChallengeTemplateValidator } from "../validators";
import { z } from "zod";

export const createChallengeTemplate = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createChallengeTemplateValidator>;

  const [created] = await db
    .insert(challengeTemplate)
    .values(validated)
    .returning();

  return c.json(created, 201);
};

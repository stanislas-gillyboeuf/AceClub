import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { featureFlag } from "../../../db/schema/feature-flag/schema";
import { eq } from "drizzle-orm";
import { updateFeatureFlagValidator } from "../validators";
import { z } from "zod";

export const updateFeatureFlag = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateFeatureFlagValidator>;

  const [existing] = await db.select().from(featureFlag).where(eq(featureFlag.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Feature flag not found" }, 404);
  }

  const [updated] = await db
    .update(featureFlag)
    .set(validated)
    .where(eq(featureFlag.id, id))
    .returning();

  return c.json(updated);
};

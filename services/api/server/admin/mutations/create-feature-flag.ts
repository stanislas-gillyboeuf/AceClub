import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { featureFlag } from "../../../db/schema/feature-flag/schema";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { createFeatureFlagValidator } from "../validators";
import { z } from "zod";

export const createFeatureFlag = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createFeatureFlagValidator>;

  const [existing] = await db
    .select()
    .from(featureFlag)
    .where(eq(featureFlag.key, validated.key))
    .limit(1);

  if (existing) {
    return c.json(
      { error: "Conflict", message: "A feature flag with this key already exists" },
      409,
    );
  }

  const [created] = await db
    .insert(featureFlag)
    .values({
      id: ulid(),
      key: validated.key,
      enabled: validated.enabled,
      description: validated.description,
    })
    .returning();

  return c.json(created, 201);
};

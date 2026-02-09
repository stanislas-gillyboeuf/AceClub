import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import {
  featureFlag,
  organizationFeatureFlag,
} from "../../../db/schema/feature-flag/schema";
import { organization } from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { setFeatureFlagOverrideValidator } from "../validators";
import { z } from "zod";

export const setFeatureFlagOverride = async (c: Context<HonoContext>) => {
  const flagId = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof setFeatureFlagOverrideValidator>;

  const [flag] = await db
    .select()
    .from(featureFlag)
    .where(eq(featureFlag.id, flagId))
    .limit(1);

  if (!flag) {
    return c.json({ error: "NotFound", message: "Feature flag not found" }, 404);
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!org) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  const [existing] = await db
    .select()
    .from(organizationFeatureFlag)
    .where(
      and(
        eq(organizationFeatureFlag.featureFlagId, flagId),
        eq(organizationFeatureFlag.organizationId, validated.organizationId),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(organizationFeatureFlag)
      .set({ enabled: validated.enabled })
      .where(eq(organizationFeatureFlag.id, existing.id))
      .returning();

    return c.json(updated);
  }

  const [created] = await db
    .insert(organizationFeatureFlag)
    .values({
      id: ulid(),
      featureFlagId: flagId,
      organizationId: validated.organizationId,
      enabled: validated.enabled,
    })
    .returning();

  return c.json(created, 201);
};

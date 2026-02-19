import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organizationFeatureFlag } from "../../../db/schema/feature-flag/schema";
import { and, eq } from "drizzle-orm";

export const removeFeatureFlagOverride = async (c: Context<HonoContext>) => {
  const flagId = c.req.param("id");
  const orgId = c.req.param("orgId");

  const [existing] = await db
    .select()
    .from(organizationFeatureFlag)
    .where(
      and(
        eq(organizationFeatureFlag.featureFlagId, flagId),
        eq(organizationFeatureFlag.organizationId, orgId),
      ),
    )
    .limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Override not found" }, 404);
  }

  await db.delete(organizationFeatureFlag).where(eq(organizationFeatureFlag.id, existing.id));

  return c.json({ success: true });
};

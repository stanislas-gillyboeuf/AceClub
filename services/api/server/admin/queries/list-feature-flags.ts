import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { featureFlag, organizationFeatureFlag } from "../../../db/schema/feature-flag/schema";
import { organization } from "../../../db/schema/auth/schema";
import { eq } from "drizzle-orm";

export const listFeatureFlags = async (c: Context<HonoContext>) => {
  const flags = await db.select().from(featureFlag).orderBy(featureFlag.createdAt);

  const overrides = await db
    .select({
      id: organizationFeatureFlag.id,
      featureFlagId: organizationFeatureFlag.featureFlagId,
      organizationId: organizationFeatureFlag.organizationId,
      enabled: organizationFeatureFlag.enabled,
      createdAt: organizationFeatureFlag.createdAt,
      updatedAt: organizationFeatureFlag.updatedAt,
      organizationName: organization.name,
    })
    .from(organizationFeatureFlag)
    .leftJoin(organization, eq(organizationFeatureFlag.organizationId, organization.id));

  const result = flags.map((flag) => ({
    ...flag,
    overrides: overrides
      .filter((o) => o.featureFlagId === flag.id)
      .map((o) => ({
        id: o.id,
        organizationId: o.organizationId,
        organizationName: o.organizationName,
        enabled: o.enabled,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
  }));

  return c.json({ featureFlags: result });
};

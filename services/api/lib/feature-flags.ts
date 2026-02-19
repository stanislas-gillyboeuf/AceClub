import { db } from "../db";
import { featureFlag, organizationFeatureFlag } from "../db/schema/feature-flag/schema";
import { and, eq } from "drizzle-orm";

export async function resolveFeatureFlag(
  flagKey: string,
  organizationId?: string | null,
): Promise<boolean> {
  const [flag] = await db.select().from(featureFlag).where(eq(featureFlag.key, flagKey)).limit(1);

  if (!flag) {
    return false;
  }

  if (organizationId) {
    const [override] = await db
      .select()
      .from(organizationFeatureFlag)
      .where(
        and(
          eq(organizationFeatureFlag.featureFlagId, flag.id),
          eq(organizationFeatureFlag.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (override) {
      return override.enabled;
    }
  }

  return flag.enabled;
}

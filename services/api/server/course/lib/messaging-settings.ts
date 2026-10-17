import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { courseMessagingSettings } from "../../../db/schema";

export async function isCourseMessagingEnabled(organizationId: string): Promise<boolean> {
  const [settings] = await db
    .select({ enabled: courseMessagingSettings.enabled })
    .from(courseMessagingSettings)
    .where(eq(courseMessagingSettings.organizationId, organizationId))
    .limit(1);

  return settings?.enabled ?? true;
}

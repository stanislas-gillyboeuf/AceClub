import { db } from "../db";
import { user } from "../db/schema/auth/schema";
import { inArray } from "drizzle-orm";
import type { NotificationAudience } from "../db/schema/notification/schema";

export async function resolveAudience(audience: NotificationAudience): Promise<string[]> {
  switch (audience.type) {
    case "all": {
      const rows = await db.select({ id: user.id }).from(user);
      return rows.map((r) => r.id);
    }
    case "user_ids": {
      if (audience.userIds.length === 0) return [];
      const rows = await db
        .select({ id: user.id })
        .from(user)
        .where(inArray(user.id, audience.userIds));
      return rows.map((r) => r.id);
    }
    default: {
      const exhaustive: never = audience;
      throw new Error(`Unknown audience type: ${JSON.stringify(exhaustive)}`);
    }
  }
}

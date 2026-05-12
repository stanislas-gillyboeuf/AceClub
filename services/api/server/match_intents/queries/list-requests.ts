import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest, userPreference } from "../../../db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const listRequests = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const requests = await db.query.matchRequest.findMany({
      where: eq(matchRequest.receiverId, userId),
      orderBy: [desc(matchRequest.createdAt)],
      with: {
        matchIntent: true,
        requester: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const requesterIds = [...new Set(requests.map((r) => r.requesterId))];
    const prefs = requesterIds.length
      ? await db
          .select({
            userId: userPreference.userId,
            skillLevel: userPreference.skillLevel,
            sport: userPreference.sport,
          })
          .from(userPreference)
          .where(inArray(userPreference.userId, requesterIds))
      : [];
    const prefMap = new Map(prefs.map((p) => [p.userId, p]));

    const data = requests.map((r) => ({
      ...r,
      requester: r.requester
        ? {
            ...r.requester,
            skillLevel: prefMap.get(r.requesterId)?.skillLevel ?? null,
            sport: prefMap.get(r.requesterId)?.sport ?? null,
          }
        : r.requester,
    }));

    return c.json(data);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [LIST REQUESTS] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};

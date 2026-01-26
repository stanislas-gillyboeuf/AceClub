import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest } from "../../../db/schema";
import { desc, eq } from "drizzle-orm";

export const listRequests = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    // Récupérer les demandes avec les infos de l'intent et du requester
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
          },
        },
      },
    });

    return c.json(requests);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [LIST REQUESTS] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};

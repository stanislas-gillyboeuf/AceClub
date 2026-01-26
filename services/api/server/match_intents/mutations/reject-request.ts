import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchRequest } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const rejectRequest = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const requestId = c.req.param("id");

    // Récupérer la demande
    const [request] = await db
      .select()
      .from(matchRequest)
      .where(and(eq(matchRequest.id, requestId), eq(matchRequest.receiverId, userId)))
      .limit(1);

    if (!request) {
      return c.json({ error: "Request not found or unauthorized" }, 404);
    }

    if (request.status !== "pending") {
      return c.json({ error: "Request already responded to" }, 400);
    }

    // Marquer la demande comme rejetée
    const [updatedRequest] = await db
      .update(matchRequest)
      .set({
        status: "rejected",
        respondedAt: new Date(),
      })
      .where(eq(matchRequest.id, requestId))
      .returning();

    return c.json({
      request: updatedRequest,
      message: "Request rejected",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("💥 [REJECT REQUEST] Error message:", errorMessage);
    return c.json({ error: (error as Error).message }, 500);
  }
};

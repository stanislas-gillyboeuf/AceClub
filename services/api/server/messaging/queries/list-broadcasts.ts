import { Context } from "hono";
import { z } from "zod";
import { count, desc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { broadcastMessage, user } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listBroadcastsValidator } from "../validators";

export const listBroadcasts = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listBroadcastsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: broadcastMessage.id,
        subject: broadcastMessage.subject,
        body: broadcastMessage.body,
        channel: broadcastMessage.channel,
        segment: broadcastMessage.segment,
        recipientCount: broadcastMessage.recipientCount,
        createdAt: broadcastMessage.createdAt,
        senderName: user.name,
      })
      .from(broadcastMessage)
      .innerJoin(user, eq(broadcastMessage.senderId, user.id))
      .where(eq(broadcastMessage.organizationId, validated.organizationId))
      .orderBy(desc(broadcastMessage.createdAt))
      .limit(validated.limit)
      .offset(validated.offset),
    db
      .select({ count: count() })
      .from(broadcastMessage)
      .where(eq(broadcastMessage.organizationId, validated.organizationId)),
  ]);

  return c.json({ broadcasts: rows, total: totalResult[0]?.count ?? 0 });
};

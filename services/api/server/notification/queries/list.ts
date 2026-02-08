import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { notification } from "../../../db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export const listNotifications = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const { limit, offset, unreadOnly } = c.req.valid("query" as never) as unknown as {
      limit: number;
      offset: number;
      unreadOnly: boolean;
    };

    const conditions = [eq(notification.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notification.isRead, false));
    }

    const notifications = await db
      .select()
      .from(notification)
      .where(and(...conditions))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset);

    // Compter le total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notification)
      .where(and(...conditions));

    return c.json({
      notifications,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("List notifications error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

export const getUnreadCount = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notification)
      .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));

    return c.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

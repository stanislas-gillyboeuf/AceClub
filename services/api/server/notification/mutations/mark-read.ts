import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { notification } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const markRead = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const { notificationId } = c.req.valid("json" as never) as unknown as {
      notificationId: string;
    };

    const [updated] = await db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      return c.json({ error: "Notification not found" }, 404);
    }

    return c.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Mark read error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

export const markAllRead = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    await db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(eq(notification.userId, userId), eq(notification.isRead, false)),
      );

    return c.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

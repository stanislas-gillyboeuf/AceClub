import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { deviceToken } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const unregisterToken = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const { token } = c.req.valid("json" as never) as unknown as {
      token: string;
    };

    await db
      .update(deviceToken)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(deviceToken.userId, userId), eq(deviceToken.token, token)));

    return c.json({
      success: true,
      message: "Token unregistered successfully",
    });
  } catch (error) {
    console.error("Unregister token error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

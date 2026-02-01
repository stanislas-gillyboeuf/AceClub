import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { deviceToken } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const registerToken = async (c: Context<HonoContext>) => {
  try {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    const { token, platform } = c.req.valid("json" as never) as unknown as {
      token: string;
      platform: "ios" | "android";
    };

    // Desactiver ce token pour tous les autres utilisateurs (un device = un user)
    await db
      .update(deviceToken)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(deviceToken.token, token), eq(deviceToken.isActive, true)));

    // Verifier si le token existe deja pour cet utilisateur
    const [existingToken] = await db
      .select()
      .from(deviceToken)
      .where(and(eq(deviceToken.userId, userId), eq(deviceToken.token, token)))
      .limit(1);

    if (existingToken) {
      // Reactiver le token pour cet utilisateur
      await db
        .update(deviceToken)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(deviceToken.id, existingToken.id));
      return c.json({ success: true, message: "Token registered" });
    }

    // Creer le nouveau token
    await db.insert(deviceToken).values({
      userId,
      token,
      platform,
    });

    return c.json({ success: true, message: "Token registered successfully" });
  } catch (error) {
    console.error("Register token error:", error);
    return c.json({ error: (error as Error).message }, 500);
  }
};

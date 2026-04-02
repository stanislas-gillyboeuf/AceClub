import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { gameConfig } from "../../../db/schema/game-config/schema";
import { eq, and } from "drizzle-orm";
import { invalidateGameConfigCache, GAME_CONFIG_DEFAULTS } from "../../../lib/game-config-service";

export const resetGameConfig = async (c: Context<HonoContext>) => {
  const session = c.get("session");

  for (const [category, entries] of Object.entries(GAME_CONFIG_DEFAULTS)) {
    for (const [key, value] of Object.entries(entries)) {
      await db
        .update(gameConfig)
        .set({
          value,
          updatedBy: session?.userId ?? null,
        })
        .where(and(eq(gameConfig.category, category as any), eq(gameConfig.key, key)));
    }
  }

  await invalidateGameConfigCache();

  return c.json({ success: true, message: "Config reset to defaults" });
};

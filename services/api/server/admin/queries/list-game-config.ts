import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { gameConfig } from "../../../db/schema/game-config/schema";

export const listGameConfig = async (c: Context<HonoContext>) => {
  const rows = await db.select().from(gameConfig).orderBy(gameConfig.category, gameConfig.key);

  const grouped: Record<string, typeof rows> = {};
  for (const row of rows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row);
  }

  return c.json({ config: grouped });
};

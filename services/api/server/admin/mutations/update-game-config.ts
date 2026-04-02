import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { gameConfig } from "../../../db/schema/game-config/schema";
import { eq } from "drizzle-orm";
import { invalidateGameConfigCache } from "../../../lib/game-config-service";
import { updateGameConfigValidator } from "../validators";
import { z } from "zod";

export const updateGameConfig = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof updateGameConfigValidator>;
  const session = c.get("session");

  const [existing] = await db.select().from(gameConfig).where(eq(gameConfig.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Config entry not found" }, 404);
  }

  const [updated] = await db
    .update(gameConfig)
    .set({
      value: validated.value,
      updatedBy: session?.userId ?? null,
    })
    .where(eq(gameConfig.id, id))
    .returning();

  await invalidateGameConfigCache();

  return c.json(updated);
};

import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { featureFlag } from "../../../db/schema/feature-flag/schema";
import { eq } from "drizzle-orm";

export const deleteFeatureFlag = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");

  const [existing] = await db.select().from(featureFlag).where(eq(featureFlag.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "NotFound", message: "Feature flag not found" }, 404);
  }

  await db.delete(featureFlag).where(eq(featureFlag.id, id));

  return c.json({ success: true });
};

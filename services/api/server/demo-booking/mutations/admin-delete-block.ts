import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoManualBlock } from "../../../db/schema";

export const deleteAdminBlock = async (c: Context<HonoContext>) => {
  const id = c.req.param("id");
  await db.delete(demoManualBlock).where(eq(demoManualBlock.id, id));
  return c.json({ ok: true });
};

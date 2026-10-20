import { Context } from "hono";
import { desc } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoManualBlock } from "../../../db/schema";

export const listAdminBlocks = async (c: Context<HonoContext>) => {
  const blocks = await db.select().from(demoManualBlock).orderBy(desc(demoManualBlock.createdAt));
  return c.json({ blocks });
};

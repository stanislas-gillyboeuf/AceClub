import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { googleCalendarConnection } from "../../../db/schema";

export const disconnectGoogle = async (c: Context<HonoContext>) => {
  await db.delete(googleCalendarConnection).where(eq(googleCalendarConnection.id, "singleton"));
  return c.json({ ok: true });
};

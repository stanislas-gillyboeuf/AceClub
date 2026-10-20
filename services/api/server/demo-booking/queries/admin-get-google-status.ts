import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { googleCalendarConnection } from "../../../db/schema";

export const getGoogleStatus = async (c: Context<HonoContext>) => {
  const [row] = await db
    .select({
      status: googleCalendarConnection.status,
      calendarId: googleCalendarConnection.calendarId,
      lastErrorMessage: googleCalendarConnection.lastErrorMessage,
      lastErrorAt: googleCalendarConnection.lastErrorAt,
      updatedAt: googleCalendarConnection.updatedAt,
    })
    .from(googleCalendarConnection)
    .where(eq(googleCalendarConnection.id, "singleton"))
    .limit(1);

  return c.json(row ?? { status: "disconnected" });
};

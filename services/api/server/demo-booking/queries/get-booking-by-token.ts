import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";

export const getBookingByToken = async (c: Context<HonoContext>) => {
  const cancelToken = c.req.param("cancelToken");

  const [booking] = await db
    .select()
    .from(demoBooking)
    .where(eq(demoBooking.cancelToken, cancelToken))
    .limit(1);

  if (!booking) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  return c.json(booking);
};

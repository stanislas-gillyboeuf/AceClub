import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking } from "../../../db/schema/court/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { cancelBookingValidator } from "../validators";

export const cancelBooking = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof cancelBookingValidator>;

  const [bookingRecord] = await db
    .select()
    .from(courtBooking)
    .where(eq(courtBooking.id, body.bookingId))
    .limit(1);

  if (!bookingRecord) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  if (bookingRecord.userId !== currentUser.id) {
    return c.json({ error: "Forbidden", message: "You can only cancel your own booking" }, 403);
  }

  if (bookingRecord.status === "cancelled") {
    return c.json({ error: "BadRequest", message: "Booking is already cancelled" }, 400);
  }

  const [updated] = await db
    .update(courtBooking)
    .set({ status: "cancelled" })
    .where(eq(courtBooking.id, body.bookingId))
    .returning();

  return c.json({ data: updated });
};

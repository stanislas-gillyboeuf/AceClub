import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking } from "../../../db/schema";
import { cancelBookingValidator } from "../validators";

export const cancelBooking = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof cancelBookingValidator>;

  const [booking] = await db
    .select()
    .from(courtBooking)
    .where(eq(courtBooking.id, validated.bookingId))
    .limit(1);

  if (!booking) {
    return c.json({ error: "NotFound", message: "Booking not found" }, 404);
  }

  if (booking.userId !== currentUser.id) {
    return c.json({ error: "Forbidden", message: "Not your booking" }, 403);
  }

  if (booking.status !== "confirmed") {
    return c.json({ error: "BadRequest", message: "Booking is not active" }, 400);
  }

  if (booking.startAt.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot cancel a past booking" }, 400);
  }

  const [updated] = await db
    .update(courtBooking)
    .set({ status: "cancelled" })
    .where(eq(courtBooking.id, validated.bookingId))
    .returning();

  return c.json(updated);
};

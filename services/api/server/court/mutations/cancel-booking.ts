import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { courtBooking, court } from "../../../db/schema";
import { cancelBookingValidator } from "../validators";
import { canAccessCourt } from "../lib/access";
import { assertOrgAdmin } from "../../../middleware/org-member";

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

  const [bookedCourt] = await db
    .select({
      organizationId: court.organizationId,
      accessPolicy: court.accessPolicy,
      cancellationPolicy: court.cancellationPolicy,
      cancellationWindowHours: court.cancellationWindowHours,
    })
    .from(court)
    .where(eq(court.id, booking.courtId))
    .limit(1);

  const isOwnBooking = booking.userId === currentUser.id;
  const isAdminOverride =
    validated.override === true &&
    !!bookedCourt &&
    ((await assertOrgAdmin(currentUser.id, bookedCourt.organizationId)) ||
      currentUser.role === "admin");

  if (!isOwnBooking && !isAdminOverride) {
    return c.json({ error: "Forbidden", message: "Not your booking" }, 403);
  }

  if (bookedCourt) {
    const allowed = await canAccessCourt(
      currentUser.id,
      bookedCourt.organizationId,
      bookedCourt.accessPolicy,
    );
    if (!allowed) {
      return c.json({ error: "Forbidden", message: "This court is reserved to club members" }, 403);
    }
  }

  if (booking.status !== "confirmed") {
    return c.json({ error: "BadRequest", message: "Booking is not active" }, 400);
  }

  if (booking.startAt.getTime() < Date.now()) {
    return c.json({ error: "BadRequest", message: "Cannot cancel a past booking" }, 400);
  }

  if (bookedCourt && !isAdminOverride) {
    if (bookedCourt.cancellationPolicy === "disabled") {
      return c.json(
        { error: "Forbidden", message: "L'annulation n'est pas autorisée pour ce court" },
        403,
      );
    }

    if (bookedCourt.cancellationPolicy === "window" && bookedCourt.cancellationWindowHours) {
      const hoursUntilStart = (booking.startAt.getTime() - Date.now()) / (60 * 60 * 1000);
      if (hoursUntilStart < bookedCourt.cancellationWindowHours) {
        return c.json(
          {
            error: "Forbidden",
            message: `Annulation possible jusqu'à ${bookedCourt.cancellationWindowHours}h avant le créneau`,
          },
          403,
        );
      }
    }
  }

  const [updated] = await db
    .update(courtBooking)
    .set({ status: "cancelled" })
    .where(eq(courtBooking.id, validated.bookingId))
    .returning();

  return c.json(updated);
};

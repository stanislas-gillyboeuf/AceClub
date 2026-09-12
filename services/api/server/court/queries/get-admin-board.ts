import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { adminBoardQueryValidator } from "../validators";
import { loadBoardData, bookedByLabel } from "../lib/board";
import { zonedDateTime } from "../lib/timezone";
import { assertOrgAdmin } from "../../../middleware/org-member";

/**
 * Superset of get-board for admin consumers: booked slots include bookingId/bookedByUserId
 * (the public board omits both for privacy) so the web dashboard can act on a booking
 * (cancel/modify/contact) directly from the grid.
 */
export const getAdminBoard = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof adminBoardQueryValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, query.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const { accessibleCourts, bookings, hourList } = await loadBoardData({
    organizationId: query.organizationId,
    sport: query.sport,
    date: query.date,
    userId: currentUser.id,
  });

  const now = new Date();

  const courts = accessibleCourts.map((c) => {
    const hours = hourList.map((hour) => {
      const slotStart = zonedDateTime(query.date, `${String(hour).padStart(2, "0")}:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      if (slotStart.getTime() < now.getTime()) {
        return { hour, status: "past" as const };
      }

      const taken = bookings.find(
        (b) => b.courtId === c.id && slotStart < b.endAt && slotEnd > b.startAt,
      );
      if (!taken) return { hour, status: "free" as const };

      return {
        hour,
        status: "booked" as const,
        bookingId: taken.id,
        bookedByUserId: taken.userId,
        bookedByName: taken.bookerName,
        bookedByLabel: taken.bookedAsClub ? "Le club" : bookedByLabel(taken.bookerName),
        bookedAsClub: taken.bookedAsClub,
        purpose: taken.purpose,
      };
    });

    return {
      id: c.id,
      name: c.name,
      surface: c.surface,
      indoor: c.indoor,
      accessPolicy: c.accessPolicy,
      cancellationPolicy: c.cancellationPolicy,
      cancellationWindowHours: c.cancellationWindowHours,
      pricePerHour: c.pricePerHour,
      slotDurationMinutes: c.slotDurationMinutes,
      hours,
    };
  });

  return c.json({ date: query.date, sport: query.sport, courts });
};

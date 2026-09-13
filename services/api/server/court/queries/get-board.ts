import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { boardQueryValidator } from "../validators";
import { loadBoardData, bookedByLabel } from "../lib/board";
import { zonedDateTime } from "../lib/timezone";

export const getBoard = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof boardQueryValidator>;

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

      if (taken.userId === currentUser.id) {
        return {
          hour,
          status: "mine" as const,
          purpose: taken.purpose,
          bookedAsClub: taken.bookedAsClub,
          kind: taken.kind,
        };
      }

      // Privacy: an admin block's reason and a course's coach name are never exposed to the
      // general member board — only "Indisponible"/"Cours" plus the kind discriminator.
      if (taken.kind === "admin_block") {
        return { hour, status: "booked" as const, bookedByLabel: "Indisponible", bookedAsClub: true, kind: "admin_block" as const };
      }
      if (taken.kind === "course") {
        return { hour, status: "booked" as const, bookedByLabel: "Cours", bookedAsClub: true, kind: "course" as const };
      }
      return {
        hour,
        status: "booked" as const,
        bookedByLabel: taken.bookedAsClub ? "Le club" : bookedByLabel(taken.bookerName),
        bookedAsClub: taken.bookedAsClub,
        purpose: taken.purpose,
        kind: "member" as const,
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

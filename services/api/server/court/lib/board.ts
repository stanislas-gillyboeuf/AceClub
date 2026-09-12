import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "../../../db";
import { court, courtBooking, user } from "../../../db/schema";
import type { CourtSportType } from "../../../db/schema";
import { canAccessCourt } from "./access";
import { getCourtSettings } from "./settings";
import { zonedDateTime } from "./timezone";

export interface BoardBooking {
  id: string;
  courtId: string;
  userId: string;
  startAt: Date;
  endAt: Date;
  purpose: string | null;
  bookedAsClub: boolean;
  bookerName: string;
}

interface LoadBoardDataParams {
  organizationId: string;
  sport: CourtSportType;
  date: string;
  userId: string;
}

/** Shared by get-board (member-facing) and get-admin-board — same courts/bookings, different field set. */
export async function loadBoardData({ organizationId, sport, date, userId }: LoadBoardDataParams) {
  const settings = await getCourtSettings(organizationId);

  const orgCourts = await db
    .select()
    .from(court)
    .where(
      and(eq(court.organizationId, organizationId), eq(court.sport, sport), eq(court.isActive, true)),
    );

  const accessibleCourts = (
    await Promise.all(
      orgCourts.map(async (row) => ({
        court: row,
        allowed: await canAccessCourt(userId, organizationId, row.accessPolicy),
      })),
    )
  )
    .filter((row) => row.allowed)
    .map((row) => row.court);

  const courtIds = accessibleCourts.map((c) => c.id);
  const dayStart = zonedDateTime(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const bookings: BoardBooking[] =
    courtIds.length === 0
      ? []
      : await db
          .select({
            id: courtBooking.id,
            courtId: courtBooking.courtId,
            userId: courtBooking.userId,
            startAt: courtBooking.startAt,
            endAt: courtBooking.endAt,
            purpose: courtBooking.purpose,
            bookedAsClub: courtBooking.bookedAsClub,
            bookerName: user.name,
          })
          .from(courtBooking)
          .innerJoin(user, eq(courtBooking.userId, user.id))
          .where(
            and(
              inArray(courtBooking.courtId, courtIds),
              eq(courtBooking.status, "confirmed"),
              gte(courtBooking.startAt, dayStart),
              lt(courtBooking.startAt, dayEnd),
            ),
          );

  const hourList: number[] = [];
  for (let h = settings.openingHour; h < settings.closingHour; h++) hourList.push(h);

  return { settings, accessibleCourts, bookings, hourList };
}

export function bookedByLabel(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

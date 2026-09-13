import { and, eq, gt, gte, isNull, lt, ne, or, sql } from "drizzle-orm";
import { db } from "../../../db";
import { courtBooking } from "../../../db/schema";
import { zonedDateTime } from "../../court/lib/timezone";

export class CourseConflictError extends Error {
  constructor(public conflictingDates: string[]) {
    super(
      `Ces dates entrent en conflit avec des réservations existantes : ${conflictingDates.join(", ")}`,
    );
    this.name = "CourseConflictError";
  }
}

export interface OccurrenceSlot {
  date: string;
  start: Date;
  end: Date;
}

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dateStringWeekday(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** Every date matching `weekday` between `startDate` and `endDate` (both "YYYY-MM-DD", inclusive),
 * turned into a concrete start/end instant using the club's timezone. */
export function computeOccurrenceSlots(params: {
  weekday: number;
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
}): OccurrenceSlot[] {
  const slots: OccurrenceSlot[] = [];
  let cursor = params.startDate;
  const daysUntilWeekday = (params.weekday - dateStringWeekday(cursor) + 7) % 7;
  cursor = addDaysToDateString(cursor, daysUntilWeekday);

  while (cursor <= params.endDate) {
    const start = zonedDateTime(cursor, params.startTime);
    const end = new Date(start.getTime() + params.durationMinutes * 60 * 1000);
    slots.push({ date: cursor, start, end });
    cursor = addDaysToDateString(cursor, 7);
  }
  return slots;
}

type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Bulk-inserts one court_booking row per slot (kind='course'). Must be called from inside a
 * transaction (`tx`) shared with whatever else needs to commit atomically alongside it (e.g.
 * the `course` row itself) — takes the same per-court advisory lock createLockedBooking uses,
 * so this can never race a concurrent member/admin booking on the same court. */
export async function insertOccurrences(
  tx: DbOrTx,
  params: {
    courtId: string;
    courseId: string;
    coachUserId: string;
    courseName: string;
    slots: OccurrenceSlot[];
    excludeCourseId?: string;
  },
): Promise<void> {
  if (params.slots.length === 0) return;

  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${params.courtId}))`);

  const rangeStart = params.slots[0].start;
  const rangeEnd = params.slots[params.slots.length - 1].end;
  const existing = await tx
    .select({ startAt: courtBooking.startAt, endAt: courtBooking.endAt })
    .from(courtBooking)
    .where(
      and(
        eq(courtBooking.courtId, params.courtId),
        eq(courtBooking.status, "confirmed"),
        gte(courtBooking.startAt, rangeStart),
        lt(courtBooking.startAt, rangeEnd),
        // Regenerating a course must not conflict against its own soon-to-be-cancelled
        // occurrences — but must still catch conflicts against unrelated bookings, so a
        // NULL courseId (any non-course booking) always counts.
        params.excludeCourseId
          ? or(isNull(courtBooking.courseId), ne(courtBooking.courseId, params.excludeCourseId))
          : sql`true`,
      ),
    );

  const conflictingDates = params.slots
    .filter((slot) => existing.some((b) => slot.start < b.endAt && slot.end > b.startAt))
    .map((slot) => slot.date);

  if (conflictingDates.length > 0) {
    throw new CourseConflictError(conflictingDates);
  }

  await tx.insert(courtBooking).values(
    params.slots.map((slot) => ({
      courtId: params.courtId,
      userId: params.coachUserId,
      startAt: slot.start,
      endAt: slot.end,
      status: "confirmed" as const,
      purpose: params.courseName,
      bookedAsClub: true,
      kind: "course" as const,
      courseId: params.courseId,
    })),
  );
}

/** Cancels every not-yet-passed occurrence of a course ("this and all future"). */
export async function cancelFutureOccurrences(tx: DbOrTx, courseId: string): Promise<void> {
  await tx
    .update(courtBooking)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(courtBooking.courseId, courseId),
        eq(courtBooking.status, "confirmed"),
        gt(courtBooking.startAt, new Date()),
      ),
    );
}

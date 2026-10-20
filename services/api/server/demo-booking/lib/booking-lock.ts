import { and, eq, gt, lt, ne, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { DemoBookingConflictError } from "./errors";
import type { DemoBookingRole } from "../../../db/schema";

interface CreateLockedDemoBookingParams {
  start: Date;
  end: Date;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  firstName: string;
  lastName: string;
  email: string;
  clubName: string;
  phone: string | null;
  role: DemoBookingRole;
  note: string | null;
  utmSource: string | null;
}

/**
 * Creates a demo booking inside a transaction guarded by a Postgres advisory lock scoped to the
 * single shared calendar, so two concurrent requests can never both pass the overlap check — same
 * pattern as server/court/lib/booking-overlap.ts's createLockedBooking. Throws
 * DemoBookingConflictError if the slot (expanded by buffer) is already taken.
 */
export async function createLockedDemoBooking(params: CreateLockedDemoBookingParams) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('demo-booking'))`);

    const bufferBeforeMs = params.bufferBeforeMinutes * 60 * 1000;
    const bufferAfterMs = params.bufferAfterMinutes * 60 * 1000;
    const expandedStart = new Date(params.start.getTime() - bufferAfterMs);
    const expandedEnd = new Date(params.end.getTime() + bufferBeforeMs);

    const [overlapping] = await tx
      .select({ id: demoBooking.id })
      .from(demoBooking)
      .where(
        and(
          eq(demoBooking.status, "confirmed"),
          lt(demoBooking.startAt, expandedEnd),
          gt(demoBooking.endAt, expandedStart),
        ),
      )
      .limit(1);

    if (overlapping) {
      throw new DemoBookingConflictError();
    }

    const [created] = await tx
      .insert(demoBooking)
      .values({
        startAt: params.start,
        endAt: params.end,
        status: "confirmed",
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        clubName: params.clubName,
        phone: params.phone,
        role: params.role,
        note: params.note,
        utmSource: params.utmSource,
        cancelToken: randomBytes(24).toString("base64url"),
      })
      .returning();

    return created;
  });
}

/** Same locking pattern as createLockedDemoBooking, for moving an existing booking to a new slot. */
export async function rescheduleLockedDemoBooking(params: {
  bookingId: string;
  start: Date;
  end: Date;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('demo-booking'))`);

    const bufferBeforeMs = params.bufferBeforeMinutes * 60 * 1000;
    const bufferAfterMs = params.bufferAfterMinutes * 60 * 1000;
    const expandedStart = new Date(params.start.getTime() - bufferAfterMs);
    const expandedEnd = new Date(params.end.getTime() + bufferBeforeMs);

    const [overlapping] = await tx
      .select({ id: demoBooking.id })
      .from(demoBooking)
      .where(
        and(
          eq(demoBooking.status, "confirmed"),
          ne(demoBooking.id, params.bookingId),
          lt(demoBooking.startAt, expandedEnd),
          gt(demoBooking.endAt, expandedStart),
        ),
      )
      .limit(1);

    if (overlapping) {
      throw new DemoBookingConflictError();
    }

    const [updated] = await tx
      .update(demoBooking)
      .set({ startAt: params.start, endAt: params.end })
      .where(eq(demoBooking.id, params.bookingId))
      .returning();

    return updated;
  });
}

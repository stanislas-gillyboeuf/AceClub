import { schedules } from "@trigger.dev/sdk";
import { and, eq, gte, isNull, lt } from "drizzle-orm";
import { db } from "../db";
import { demoBooking } from "../db/schema";
import { sendReminderEmail } from "../server/demo-booking/lib/emails";
import {
  addDaysToDateString,
  dateStringInTimeZone,
  zonedDateTime,
} from "../server/demo-booking/lib/timezone";

const PARIS_TZ = "Europe/Paris";

async function sendDayBeforeReminders(now: Date): Promise<number> {
  const parisHour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: PARIS_TZ, hour: "2-digit", hourCycle: "h23" }).format(now),
  );
  // Only fires during the 18:00-18:59 Paris window — idempotent via reminderDayBeforeSentAt,
  // so re-running the four ticks in that hour is harmless.
  if (parisHour !== 18) return 0;

  const today = dateStringInTimeZone(now, PARIS_TZ);
  const tomorrow = addDaysToDateString(today, 1);
  const dayAfterTomorrow = addDaysToDateString(today, 2);

  const windowStart = zonedDateTime(tomorrow, "00:00", PARIS_TZ);
  const windowEnd = zonedDateTime(dayAfterTomorrow, "00:00", PARIS_TZ);

  const bookings = await db
    .select()
    .from(demoBooking)
    .where(
      and(
        eq(demoBooking.status, "confirmed"),
        isNull(demoBooking.reminderDayBeforeSentAt),
        gte(demoBooking.startAt, windowStart),
        lt(demoBooking.startAt, windowEnd),
      ),
    );

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking, "veille");
      await db
        .update(demoBooking)
        .set({ reminderDayBeforeSentAt: new Date() })
        .where(eq(demoBooking.id, booking.id));
      sent++;
    } catch (error) {
      console.error(`[TRIGGER] Failed to send day-before reminder for booking ${booking.id}:`, error);
    }
  }
  return sent;
}

async function sendHourBeforeReminders(now: Date): Promise<number> {
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 75 * 60 * 1000);

  const bookings = await db
    .select()
    .from(demoBooking)
    .where(
      and(
        eq(demoBooking.status, "confirmed"),
        isNull(demoBooking.reminderHourBeforeSentAt),
        gte(demoBooking.startAt, windowStart),
        lt(demoBooking.startAt, windowEnd),
      ),
    );

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking, "bientôt");
      await db
        .update(demoBooking)
        .set({ reminderHourBeforeSentAt: new Date() })
        .where(eq(demoBooking.id, booking.id));
      sent++;
    } catch (error) {
      console.error(`[TRIGGER] Failed to send hour-before reminder for booking ${booking.id}:`, error);
    }
  }
  return sent;
}

export const demoBookingRemindersTask = schedules.task({
  id: "demo-booking-reminders",
  cron: {
    pattern: "*/15 * * * *",
    timezone: "UTC",
  },
  run: async (payload) => {
    const dayBeforeSent = await sendDayBeforeReminders(payload.timestamp);
    const hourBeforeSent = await sendHourBeforeReminders(payload.timestamp);
    console.log(
      `[TRIGGER] demo-booking-reminders: ${dayBeforeSent} day-before, ${hourBeforeSent} hour-before`,
    );
    return { dayBeforeSent, hourBeforeSent, timestamp: payload.timestamp };
  },
});

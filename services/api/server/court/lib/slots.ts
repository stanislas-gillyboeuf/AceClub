import { zonedDateTime } from "./timezone";

export interface DaySlot {
  startTime: string; // "HH:mm"
  start: Date;
  end: Date;
}

interface SlotConfig {
  openingHour: number;
  closingHour: number;
  slotDurationMinutes: number;
}

/** Build the fixed slots for a given "YYYY-MM-DD" date, from opening to closing hour. */
export function buildDaySlots(date: string, config: SlotConfig): DaySlot[] {
  const slots: DaySlot[] = [];
  const dayStartMinutes = config.openingHour * 60;
  const dayEndMinutes = config.closingHour * 60;

  for (
    let startMinutes = dayStartMinutes;
    startMinutes + config.slotDurationMinutes <= dayEndMinutes;
    startMinutes += config.slotDurationMinutes
  ) {
    const hh = String(Math.floor(startMinutes / 60)).padStart(2, "0");
    const mm = String(startMinutes % 60).padStart(2, "0");
    const start = zonedDateTime(date, `${hh}:${mm}`);
    const end = new Date(start.getTime() + config.slotDurationMinutes * 60 * 1000);
    slots.push({ startTime: `${hh}:${mm}`, start, end });
  }

  return slots;
}

export function slotFromStartTime(
  date: string,
  startTime: string,
  slotDurationMinutes: number,
): { start: Date; end: Date } {
  const start = zonedDateTime(date, startTime);
  const end = new Date(start.getTime() + slotDurationMinutes * 60 * 1000);
  return { start, end };
}

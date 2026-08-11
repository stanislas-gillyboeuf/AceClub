export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 22;
export const SLOT_DURATION_MIN = 60;

export interface DaySlot {
  startTime: string; // "HH:00"
  start: Date;
  end: Date;
}

/** Build the fixed 1h slots for a given "YYYY-MM-DD" date, from opening to closing hour. */
export function buildDaySlots(date: string): DaySlot[] {
  const slots: DaySlot[] = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
    const end = new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000);
    slots.push({ startTime: `${String(hour).padStart(2, "0")}:00`, start, end });
  }
  return slots;
}

export function slotFromStartTime(date: string, startTime: string): { start: Date; end: Date } {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000);
  return { start, end };
}

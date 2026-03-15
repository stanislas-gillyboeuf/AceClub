export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

const longDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

export function formatLongDate(date: Date): string {
  const formatted = longDateFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // getDay(): 0=Sun, 1=Mon ... 6=Sat → shift to Monday-based
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

const shortWeekdayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

export function formatShortWeekday(date: Date): string {
  return shortWeekdayFormatter.format(date).replace(".", "").toUpperCase().slice(0, 3);
}

export const monthYearFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function getMatchDisplayDate(match: { scheduledAt?: string | null; startedAt?: string | null; createdAt: string }): string {
  return match.scheduledAt ?? match.startedAt ?? match.createdAt;
}

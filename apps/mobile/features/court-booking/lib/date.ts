export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function nextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const weekdayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

export function formatChipWeekday(date: Date, index: number): string {
  if (index === 0) return "Auj.";
  const formatted = weekdayFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const fullDayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });
const fullMonthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long" });

/** "Aujourd'hui 12 août" / "mercredi 12 août" — used for sheet/ticket subtitles. */
export function formatFullDay(date: Date, index: number): string {
  const prefix = index === 0 ? "Aujourd'hui" : fullDayFormatter.format(date);
  return `${prefix} ${date.getDate()} ${fullMonthFormatter.format(date)}`;
}

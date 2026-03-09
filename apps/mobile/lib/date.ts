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

export function formatLongDate(date: Date, locale = "fr-FR"): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const formatted = formatter.format(date);
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

export function formatShortWeekday(date: Date): string {
  const formatted = new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date);
  return formatted.replace(".", "").toUpperCase().slice(0, 3);
}

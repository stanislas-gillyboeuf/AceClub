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
  if (index === 0) return "Aujourd'hui";
  const formatted = weekdayFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  if (isYesterday(date)) {
    return "Hier";
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export function formatMatchDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatShortDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "d MMM yyyy", { locale: fr });
}

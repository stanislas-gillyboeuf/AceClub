import type { CourtCancellationPolicy } from "@/types/court";

export function buildCancellationText(
  policy: CourtCancellationPolicy,
  windowHours: number | null,
): string {
  if (policy === "disabled") return "Les réservations sur ce terrain ne sont pas annulables.";
  if (policy === "window" && windowHours != null) {
    return `Annulation gratuite jusqu'à ${windowHours}h avant le créneau.`;
  }
  return "Annulation gratuite à tout moment avant le créneau.";
}

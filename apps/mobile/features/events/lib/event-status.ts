import { colors, semanticColors } from "@/constants/theme";
import type { ColorScheme } from "@/hooks/use-color-scheme";
import type { EventStatus, EventVisibility } from "@/types/event";

export interface EventStatusConfig {
  value: EventStatus;
  label: string;
  color: string;
}

export function getEventStatusConfig(scheme: ColorScheme): EventStatusConfig[] {
  return [
    { value: "draft", label: "Brouillon", color: colors.gray400 },
    { value: "presale", label: "Prévente", color: colors.accentOrange },
    { value: "on_sale", label: "En vente", color: semanticColors.accentGreen[scheme] },
    { value: "completed", label: "Terminé", color: colors.gray500 },
    { value: "full", label: "Complet", color: "#8B5CF6" },
    { value: "cancelled", label: "Annulé", color: colors.red500 },
    { value: "archived", label: "Archivé", color: colors.gray400 },
  ];
}

export function getEventStatusMap(scheme: ColorScheme): Record<EventStatus, EventStatusConfig> {
  return Object.fromEntries(
    getEventStatusConfig(scheme).map((s) => [s.value, s]),
  ) as Record<EventStatus, EventStatusConfig>;
}

export const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "organization", label: "Privé (club)" },
];

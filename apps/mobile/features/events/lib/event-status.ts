import { colors } from "@/constants/theme";
import type { EventStatus, EventVisibility } from "@/types/event";

export interface EventStatusConfig {
  value: EventStatus;
  label: string;
  color: string;
}

export const EVENT_STATUS_CONFIG: EventStatusConfig[] = [
  { value: "draft", label: "Brouillon", color: colors.gray400 },
  { value: "presale", label: "Prévente", color: colors.accentOrange },
  { value: "on_sale", label: "En vente", color: colors.accentGreen },
  { value: "completed", label: "Terminé", color: colors.gray500 },
  { value: "full", label: "Complet", color: "#8B5CF6" },
  { value: "cancelled", label: "Annulé", color: colors.red500 },
  { value: "archived", label: "Archivé", color: colors.gray400 },
];

export const EVENT_STATUS_MAP = Object.fromEntries(
  EVENT_STATUS_CONFIG.map((s) => [s.value, s]),
) as Record<EventStatus, EventStatusConfig>;

export const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "organization", label: "Privé (club)" },
];

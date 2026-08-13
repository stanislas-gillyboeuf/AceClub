import type { BoardCourt, CourtSport, CourtSurface } from "@/types/court";

export const SURFACE_LABELS: Record<CourtSurface, string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  carpet: "Moquette",
};

export interface CourtTypeFilter {
  key: string;
  label: string;
  matches: (court: BoardCourt) => boolean;
}

const ANY_FILTER: CourtTypeFilter = { key: "any", label: "Peu importe", matches: () => true };

/** Derives the filter chips from the courts actually present, instead of a hardcoded per-sport list. */
export function buildCourtTypeFilters(sport: CourtSport, courts: BoardCourt[]): CourtTypeFilter[] {
  if (sport === "padel") {
    const filters: CourtTypeFilter[] = [ANY_FILTER];
    if (courts.some((c) => !c.indoor)) {
      filters.push({ key: "outdoor", label: "Extérieur", matches: (c) => !c.indoor });
    }
    if (courts.some((c) => c.indoor)) {
      filters.push({ key: "indoor", label: "Indoor", matches: (c) => c.indoor });
    }
    return filters;
  }

  const surfaces = Array.from(new Set(courts.map((c) => c.surface).filter((s): s is CourtSurface => !!s)));
  const filters: CourtTypeFilter[] = [
    ANY_FILTER,
    ...surfaces.map((surface) => ({
      key: surface,
      label: SURFACE_LABELS[surface],
      matches: (c: BoardCourt) => c.surface === surface,
    })),
  ];
  if (courts.some((c) => c.indoor)) {
    filters.push({ key: "covered", label: "Couvert", matches: (c) => c.indoor });
  }
  return filters;
}

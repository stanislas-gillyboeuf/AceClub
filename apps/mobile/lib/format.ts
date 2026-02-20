import type { MatchWithParticipants, MatchParticipant, MatchDetail } from "@/types/match";

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function formatMatchScore(match: MatchWithParticipants): string {
  const sets = match.sets;
  if (!sets || sets.length === 0) return "-";

  const home = getHomeParticipant(match);
  const away = getAwayParticipant(match);
  if (!home || !away) return "-";

  let homeSetsWon = 0;
  let awaySetsWon = 0;

  for (const set of sets) {
    const homeGames =
      set.scores?.find((s) => s.userId === home.userId)?.games ?? 0;
    const awayGames =
      set.scores?.find((s) => s.userId === away.userId)?.games ?? 0;
    if (homeGames > awayGames) homeSetsWon++;
    else if (awayGames > homeGames) awaySetsWon++;
  }

  return `${homeSetsWon} - ${awaySetsWon}`;
}

export function formatMatchDuration(
  match: MatchWithParticipants
): string | null {
  if (!match.startedAt || !match.finishedAt) return null;

  const start = new Date(match.startedAt).getTime();
  const end = new Date(match.finishedAt).getTime();
  const diffMs = end - start;

  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);
  if (totalMinutes === 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  return `${minutes}m`;
}

export function formatMatchDate(match: MatchWithParticipants): string {
  const dateStr = match.finishedAt ?? match.startedAt ?? match.createdAt;
  const date = new Date(dateStr);

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getHomeParticipant(
  match: MatchWithParticipants
): MatchParticipant | undefined {
  return match.participants.find((p) => p.side === "home");
}

export function getAwayParticipant(
  match: MatchWithParticipants
): MatchParticipant | undefined {
  return match.participants.find((p) => p.side === "away");
}

export function matchDetailToMatchWithParticipants(detail: MatchDetail): MatchWithParticipants {
  return {
    ...detail.match,
    participants: detail.participants,
    sets: detail.sets,
    comments: detail.comments ?? [],
  };
}

export function formatAces(count: number | undefined | null): string {
  if (count == null) return "0";
  if (count >= 1000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return count.toString();
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes}min`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/** Haversine distance in km between two lat/lon points */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Estimated travel time in minutes (road factor 1.3, avg 30 km/h) */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  return Math.round((distanceKm * 1.3) / 30 * 60);
}

/** Human-readable travel time string */
export function estimateTravelTime(distanceKm: number): string {
  const minutes = estimateTravelTimeMinutes(distanceKm);
  if (minutes < 1) return "< 1 min";
  return `~${minutes} min`;
}

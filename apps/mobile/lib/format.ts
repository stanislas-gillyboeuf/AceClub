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

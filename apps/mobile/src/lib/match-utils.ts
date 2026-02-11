import type { MatchListItem, MatchSet, MatchParticipant } from "@/types/match";

export function getHomeParticipant(
  participants: MatchParticipant[]
): MatchParticipant | undefined {
  return participants.find((p) => p.side === "home");
}

export function getAwayParticipant(
  participants: MatchParticipant[]
): MatchParticipant | undefined {
  return participants.find((p) => p.side === "away");
}

export function getSetWinner(set: MatchSet): string | undefined {
  if (set.scores.length !== 2) return undefined;
  const sorted = [...set.scores].sort((a, b) => b.games - a.games);
  if (sorted[0].games > sorted[1].games) return sorted[0].userId;
  return undefined;
}

export function getMatchScore(
  sets: MatchSet[],
  participants: MatchParticipant[]
): { home: number; away: number } {
  const home = getHomeParticipant(participants);
  const away = getAwayParticipant(participants);
  let homeWins = 0;
  let awayWins = 0;

  for (const set of sets) {
    const winner = getSetWinner(set);
    if (winner === home?.userId) homeWins++;
    else if (winner === away?.userId) awayWins++;
  }

  return { home: homeWins, away: awayWins };
}

export function formatMatchScore(
  sets: MatchSet[],
  participants: MatchParticipant[]
): string {
  const score = getMatchScore(sets, participants);
  return `${score.home}-${score.away}`;
}

export function getMatchDuration(match: MatchListItem): string | null {
  if (!match.startedAt || !match.finishedAt) return null;
  const start = new Date(match.startedAt).getTime();
  const end = new Date(match.finishedAt).getTime();
  const durationMs = end - start;
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function didUserWin(
  match: MatchListItem,
  userId: string
): boolean {
  return (
    match.participants.find((p) => p.userId === userId)?.isWinner ?? false
  );
}

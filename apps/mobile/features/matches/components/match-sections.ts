import { startOfDay, formatDayKey } from "@/lib/date";
import type { MatchWithParticipants } from "@/types/match";

export interface MatchSection {
  key: string;
  date: Date;
  isToday: boolean;
  data: MatchWithParticipants[];
}

export function buildSections(matches: MatchWithParticipants[]): MatchSection[] {
  const today = startOfDay(new Date());
  const todayKey = formatDayKey(today);

  const grouped = new Map<string, { date: Date; matches: MatchWithParticipants[] }>();

  for (const match of matches) {
    const dateStr = match.scheduledAt ?? match.startedAt ?? match.createdAt;
    const day = startOfDay(new Date(dateStr));
    const key = formatDayKey(day);

    if (!grouped.has(key)) {
      grouped.set(key, { date: day, matches: [] });
    }
    grouped.get(key)!.matches.push(match);
  }

  if (!grouped.has(todayKey)) {
    grouped.set(todayKey, { date: today, matches: [] });
  }

  for (const group of grouped.values()) {
    group.matches.sort((a, b) => {
      const aDate = new Date(a.scheduledAt ?? a.startedAt ?? a.createdAt).getTime();
      const bDate = new Date(b.scheduledAt ?? b.startedAt ?? b.createdAt).getTime();
      return aDate - bDate;
    });
  }

  return Array.from(grouped.entries())
    .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
    .map(([key, { date, matches: sectionMatches }]) => ({
      key,
      date,
      isToday: key === todayKey,
      data:
        sectionMatches.length > 0
          ? sectionMatches
          : (["__empty__"] as unknown as MatchWithParticipants[]),
    }));
}

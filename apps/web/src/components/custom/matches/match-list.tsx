"use client";

import { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Swords } from "lucide-react";
import { useMatches } from "@/hooks/use-match-queries";
import type { MatchListItem, MatchParticipant } from "@/types/match";

// --- Helpers ---

function getDisplayDate(match: MatchListItem): Date {
  return new Date(match.scheduledAt ?? match.startedAt ?? match.createdAt);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatSectionDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const parts = formatter.format(date);
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMatchScore(match: MatchListItem): { home: number; away: number } | null {
  if (!match.sets || match.sets.length === 0) return null;

  let homeWins = 0;
  let awayWins = 0;

  for (const set of match.sets) {
    const homeScore = set.scores.find((s) => s.side === "home")?.games ?? 0;
    const awayScore = set.scores.find((s) => s.side === "away")?.games ?? 0;
    if (homeScore > awayScore) homeWins++;
    else if (awayScore > homeScore) awayWins++;
  }

  return { home: homeWins, away: awayWins };
}

function getFormattedDuration(match: MatchListItem): string | null {
  if (!match.startedAt || !match.finishedAt) return null;
  const start = new Date(match.startedAt);
  const end = new Date(match.finishedAt);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return null;

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface DateSection {
  key: string;
  date: Date;
  matches: MatchListItem[];
  isToday: boolean;
}

// --- Match Row ---

function MatchRow({ match }: { match: MatchListItem }) {
  const homeParticipant = match.participants.find((p) => p.side === "home");
  const awayParticipant = match.participants.find((p) => p.side === "away");
  const score = getMatchScore(match);
  const duration = getFormattedDuration(match);
  const displayDate = getDisplayDate(match);

  const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: "Planifié", color: "bg-blue-500" },
    ongoing: { label: "En cours", color: "bg-orange-500" },
    finished: { label: "Terminé", color: "bg-green-500" },
  };

  const status = statusConfig[match.status] ?? statusConfig.scheduled;

  return (
    <Link href={`/app/matches/${match.id}`}>
      <div
        className={`space-y-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50 ${
          match.status === "ongoing" ? "border-orange-500/30 border-2" : "border-border"
        }`}
      >
        {/* Top row: time + status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            <span className="text-sm">{formatTime(displayDate)}</span>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        {/* Players row */}
        <div className="flex items-center gap-3">
          {/* Home player */}
          <PlayerView participant={homeParticipant} isWinner={homeParticipant?.isWinner === true} />

          <span className="text-sm text-muted-foreground">vs</span>

          {/* Away player */}
          <PlayerView participant={awayParticipant} isWinner={awayParticipant?.isWinner === true} />

          <div className="ml-auto text-right">
            {/* Score */}
            <p className="text-lg font-bold tabular-nums">
              {score ? `${score.home}-${score.away}` : "—"}
            </p>
            {/* Duration */}
            {duration && (
              <div className="flex items-center justify-end gap-1 text-muted-foreground">
                <Clock className="size-3" />
                <span className="text-xs">{duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlayerView({
  participant,
  isWinner,
}: {
  participant?: MatchParticipant;
  isWinner: boolean;
}) {
  const name = participant?.user?.name ?? "N/A";
  const image = participant?.user?.image;
  const initial = name.charAt(0);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <span className={`text-sm leading-tight ${isWinner ? "font-bold" : ""}`}>
          {name.split(" ")[0]}
        </span>
        {isWinner && <span className="text-xs">👑</span>}
      </div>
    </div>
  );
}

// --- Section Header ---

function DateSectionHeader({ date, today }: { date: Date; today: boolean }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/95 px-5 py-2.5 backdrop-blur-sm">
      {today && <div className="size-2 rounded-full bg-primary" />}

      <span className={`text-sm font-semibold ${today ? "text-primary" : "text-foreground"}`}>
        {formatSectionDate(date)}
      </span>

      {today && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          Aujourd&apos;hui
        </span>
      )}
    </div>
  );
}

// --- Today Empty ---

function TodayEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-6">
      <Swords className="size-8 text-primary/60" />
      <p className="text-sm font-medium">Pas de match aujourd&apos;hui</p>
      <p className="text-xs text-muted-foreground">Planifie un match et lance-toi !</p>
    </div>
  );
}

// --- Skeleton ---

function MatchRowSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <div className="ml-auto">
          <Skeleton className="h-6 w-10" />
        </div>
      </div>
    </div>
  );
}

// --- Main List ---

export function MatchList() {
  const { data, isPending } = useMatches({ limit: 50 });
  const matches = data?.matches ?? [];
  const todayRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Group matches by date
  const sections: DateSection[] = useMemo(() => {
    const groups = new Map<string, MatchListItem[]>();

    for (const match of matches) {
      const date = getDisplayDate(match);
      const key = toDateKey(date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(match);
    }

    // Always include today
    const todayKey = toDateKey(new Date());
    if (!groups.has(todayKey)) groups.set(todayKey, []);

    // Sort matches within each group by time ascending
    const result: DateSection[] = [];
    for (const [key, groupMatches] of groups) {
      const sorted = [...groupMatches].sort(
        (a, b) => getDisplayDate(a).getTime() - getDisplayDate(b).getTime(),
      );
      const date = new Date(key + "T00:00:00");
      result.push({ key, date, matches: sorted, isToday: isToday(date) });
    }

    // Sort sections by date ascending
    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    return result;
  }, [matches]);

  // Scroll to today on first load
  useEffect(() => {
    if (!isPending && matches.length > 0 && !hasScrolled.current && todayRef.current) {
      hasScrolled.current = true;
      todayRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [isPending, matches.length]);

  if (isPending) {
    return (
      <div className="space-y-3 px-5 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <MatchRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (matches.length === 0 && sections.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Swords className="size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium">Aucun match</p>
        <p className="text-xs text-muted-foreground">
          Tes matchs apparaîtront ici une fois planifiés ou joués.
        </p>
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => (
        <div key={section.key} ref={section.isToday ? todayRef : undefined}>
          <DateSectionHeader date={section.date} today={section.isToday} />

          <div className="space-y-3 px-5 py-2">
            {section.matches.length === 0 && section.isToday ? (
              <TodayEmpty />
            ) : (
              section.matches.map((match) => <MatchRow key={match.id} match={match} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

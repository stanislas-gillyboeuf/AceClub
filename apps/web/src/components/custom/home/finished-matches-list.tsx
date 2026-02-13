"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Crown } from "lucide-react";
import { useMatches } from "@/hooks/use-match-queries";
import { useSession } from "@/lib/auth-client";
import type { MatchListItem, MatchParticipant } from "@/types/match";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function PlayerView({
  participant,
  isWinner,
}: {
  participant: MatchParticipant | undefined;
  isWinner: boolean;
}) {
  const name = participant?.user?.name;
  const image = participant?.user?.image;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(name ?? undefined)}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <span className={`text-sm ${isWinner ? "font-semibold" : ""}`}>
          {name?.split(" ")[0] ?? "N/A"}
        </span>
        {isWinner && <Crown className="size-3 text-yellow-500 fill-yellow-500" />}
      </div>
    </div>
  );
}

function MatchRow({ match, currentUserId }: { match: MatchListItem; currentUserId: string }) {
  const homeParticipant = match.participants.find((p) => p.side === "home");
  const awayParticipant = match.participants.find((p) => p.side === "away");
  const homeIsWinner = homeParticipant?.isWinner ?? false;
  const awayIsWinner = awayParticipant?.isWinner ?? false;

  const currentUserWon =
    match.participants.find((p) => p.userId === currentUserId)?.isWinner ?? false;

  const formattedScore = match.sets
    .map((s) => {
      const home = s.scores.find((sc) => sc.side === "home")?.games ?? 0;
      const away = s.scores.find((sc) => sc.side === "away")?.games ?? 0;
      return `${home}-${away}`;
    })
    .join(" ");

  const displayDate = match.finishedAt ?? match.startedAt ?? match.createdAt;

  return (
    <Link href={`/app/matches/${match.id}`}>
      <Card className="p-4 transition-all hover:scale-[0.99] hover:bg-accent/50 active:scale-[0.98]">
        <div className="space-y-3">
          {/* Top: date + result badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span className="text-sm">{formatDate(displayDate)}</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                currentUserWon ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {currentUserWon ? "Victoire" : "Défaite"}
            </span>
          </div>

          {/* Players + score row */}
          <div className="flex items-center gap-3">
            <PlayerView participant={homeParticipant} isWinner={homeIsWinner} />

            <span className="text-sm text-muted-foreground">vs</span>

            <PlayerView participant={awayParticipant} isWinner={awayIsWinner} />

            <div className="ml-auto text-right">
              <p className="text-lg font-bold tabular-nums">{formattedScore || "—"}</p>
              {match.finishedAt && match.startedAt && (
                <div className="flex items-center justify-end gap-1 text-muted-foreground">
                  <Clock className="size-3" />
                  <span className="text-xs">
                    {formatDuration(match.startedAt, match.finishedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  const diffMinutes = Math.round((end - start) / 60000);
  if (diffMinutes < 60) return `${diffMinutes}min`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hours}h${mins.toString().padStart(2, "0")}` : `${hours}h`;
}

export function FinishedMatchesList() {
  const { data, isPending } = useMatches({ status: "finished", limit: 20 });
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";

  const matches = data?.matches ?? [];

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Matchs récents au club
      </h2>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-12 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
          <p className="text-sm">Aucun match récent</p>
          <p className="text-xs">Vos matchs récents au club apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}

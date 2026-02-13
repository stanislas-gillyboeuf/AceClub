"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MatchListItem } from "@/types/match";

interface OngoingMatchCardProps {
  match: MatchListItem;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PlayerView({
  participant,
}: {
  participant: { user: { name: string; image: string | null } | null } | undefined;
}) {
  const name = participant?.user?.name;
  const image = participant?.user?.image;

  return (
    <div className="flex flex-col items-center gap-1">
      <Avatar className="size-8">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
          {getInitials(name ?? undefined)}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-16 truncate text-[11px]">{name?.split(" ")[0] ?? "N/A"}</span>
    </div>
  );
}

export function OngoingMatchCard({ match }: OngoingMatchCardProps) {
  const homeParticipant = match.participants.find((p) => p.side === "home");
  const awayParticipant = match.participants.find((p) => p.side === "away");

  const formattedScore = match.sets
    .map((s) => {
      const home = s.scores.find((sc) => sc.side === "home")?.games ?? 0;
      const away = s.scores.find((sc) => sc.side === "away")?.games ?? 0;
      return `${home}-${away}`;
    })
    .join(" ");

  return (
    <Link href={`/app/matches/${match.id}`}>
      <Card className="w-52 shrink-0 border-2 border-orange-400/30 p-3 transition-all hover:scale-[0.98] hover:opacity-90 active:scale-[0.97]">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              En cours
            </span>
            <span className="text-xs text-muted-foreground">Set {match.sets.length || 1}</span>
          </div>

          {/* Players + score */}
          <div className="flex items-center justify-between">
            <PlayerView participant={homeParticipant} />
            <span className="text-lg font-bold tabular-nums">{formattedScore || "0-0"}</span>
            <PlayerView participant={awayParticipant} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

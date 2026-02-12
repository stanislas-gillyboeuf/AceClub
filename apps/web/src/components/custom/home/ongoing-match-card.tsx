"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MatchListItem } from "@/types/match";

interface OngoingMatchCardProps {
  match: MatchListItem;
}

export function OngoingMatchCard({ match }: OngoingMatchCardProps) {
  const sideHome = match.participants.filter((p) => p.side === "home");
  const sideAway = match.participants.filter((p) => p.side === "away");

  return (
    <Link href={`/app/matches/${match.id}`}>
      <Card className="w-64 shrink-0 transition-colors hover:bg-accent/50">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {match.sport === "padel" ? "Padel" : "Tennis"}
            </Badge>
            <span className="text-xs text-muted-foreground">En cours</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {sideHome.map((p) => (
                <Avatar key={p.id} className="size-6">
                  <AvatarImage src={p.user?.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{p.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              <span className="text-xs truncate max-w-16">
                {sideHome.map((p) => p.user?.name?.split(" ")[0]).join(" / ")}
              </span>
            </div>
            <span className="text-sm font-bold">vs</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs truncate max-w-16">
                {sideAway.map((p) => p.user?.name?.split(" ")[0]).join(" / ")}
              </span>
              {sideAway.map((p) => (
                <Avatar key={p.id} className="size-6">
                  <AvatarImage src={p.user?.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{p.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          {(match.sets?.length ?? 0) > 0 && (
            <div className="flex justify-center gap-2 text-xs font-mono">
              {match.sets.map((s) => {
                const homeGames = s.scores.find((sc) => sc.side === "home")?.games ?? 0;
                const awayGames = s.scores.find((sc) => sc.side === "away")?.games ?? 0;
                return (
                  <span key={s.id}>
                    {homeGames}-{awayGames}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

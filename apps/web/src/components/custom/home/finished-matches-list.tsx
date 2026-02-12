"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatches } from "@/hooks/use-match-queries";
import type { MatchListItem } from "@/types/match";

function MatchRow({ match }: { match: MatchListItem }) {
  const sideHome = match.participants.filter((p) => p.side === "home");
  const sideAway = match.participants.filter((p) => p.side === "away");
  const winningSide = match.participants.find((p) => p.isWinner)?.side;

  return (
    <Link href={`/app/matches/${match.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {match.sport === "padel" ? "Padel" : "Tennis"}
              </Badge>
              {match.finishedAt && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(match.finishedAt).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`flex items-center gap-1 ${winningSide === "home" ? "font-semibold" : ""}`}
              >
                {sideHome.map((p) => (
                  <Avatar key={p.id} className="size-5">
                    <AvatarImage src={p.user?.image ?? undefined} />
                    <AvatarFallback className="text-[8px]">
                      {p.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <span className="text-xs">
                  {sideHome.map((p) => p.user?.name?.split(" ")[0]).join("/")}
                </span>
              </div>
              <div className="flex gap-1 font-mono text-xs">
                {(match.sets ?? []).map((s) => {
                  const homeGames = s.scores.find((sc) => sc.side === "home")?.games ?? 0;
                  const awayGames = s.scores.find((sc) => sc.side === "away")?.games ?? 0;
                  return (
                    <span key={s.id}>
                      {homeGames}-{awayGames}
                    </span>
                  );
                })}
              </div>
              <div
                className={`flex items-center gap-1 ${winningSide === "away" ? "font-semibold" : ""}`}
              >
                <span className="text-xs">
                  {sideAway.map((p) => p.user?.name?.split(" ")[0]).join("/")}
                </span>
                {sideAway.map((p) => (
                  <Avatar key={p.id} className="size-5">
                    <AvatarImage src={p.user?.image ?? undefined} />
                    <AvatarFallback className="text-[8px]">
                      {p.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FinishedMatchesList() {
  const { data, isPending } = useMatches({ status: "finished", limit: 20 });

  const matches = data?.matches ?? [];

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Matchs terminés</h2>
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun match terminé pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">Matchs terminés</h2>
      <div className="space-y-2">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

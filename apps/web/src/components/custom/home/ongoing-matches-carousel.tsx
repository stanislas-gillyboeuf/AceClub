"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OngoingMatchCard } from "./ongoing-match-card";
import { useMatches } from "@/hooks/use-match-queries";

export function OngoingMatchesCarousel() {
  const { data, isPending } = useMatches({ status: "ongoing", limit: 10 });

  const matches = data?.matches ?? [];

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-64 shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">Matchs en cours</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {matches.map((match) => (
          <OngoingMatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

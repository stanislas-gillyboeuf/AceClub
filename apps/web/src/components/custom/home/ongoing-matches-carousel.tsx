"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OngoingMatchCard } from "./ongoing-match-card";
import { useMatches } from "@/hooks/use-match-queries";

export function OngoingMatchesCarousel() {
  const { data, isPending } = useMatches({ status: "ongoing", limit: 10 });

  const matches = data?.matches ?? [];

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-52 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        En cours
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {matches.map((match) => (
          <OngoingMatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

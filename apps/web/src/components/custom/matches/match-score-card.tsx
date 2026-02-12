"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchSet } from "@/types/match";

interface MatchScoreCardProps {
  sets: MatchSet[];
}

export function MatchScoreCard({ sets }: MatchScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-6">
          {sets
            .sort((a, b) => a.setNumber - b.setNumber)
            .map((s) => {
              const homeGames = s.scores.find((sc) => sc.side === "home")?.games ?? 0;
              const awayGames = s.scores.find((sc) => sc.side === "away")?.games ?? 0;
              return (
                <div key={s.id} className="text-center">
                  <p className="text-[10px] text-muted-foreground">Set {s.setNumber}</p>
                  <p className="text-lg font-mono font-bold">
                    {homeGames} - {awayGames}
                  </p>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

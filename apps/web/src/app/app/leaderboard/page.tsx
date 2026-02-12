"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Trophy } from "lucide-react";
import { useGlobalLeaderboard, useWeeklyLeaderboard } from "@/hooks/use-gamification-queries";
import type { LeaderboardEntry } from "@/types/gamification";

function LeaderboardRow({ entry, highlight }: { entry: LeaderboardEntry; highlight: boolean }) {
  const rankColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-md p-2 ${highlight ? "bg-primary/5 border border-primary/20" : ""}`}
    >
      <span
        className={`w-6 text-center text-sm font-bold ${rankColors[entry.rank] ?? "text-muted-foreground"}`}
      >
        {entry.rank}
      </span>
      <Avatar className="size-8">
        <AvatarImage src={entry.userImage ?? undefined} />
        <AvatarFallback className="text-xs">{entry.userName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{entry.userName}</p>
        <p className="text-[10px] text-muted-foreground">Niveau {entry.currentLevel}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{entry.totalAces}</p>
        <p className="text-[10px] text-muted-foreground">aces</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [type, setType] = useState<"all-time" | "weekly">("all-time");
  const { data: globalData, isPending: globalPending } = useGlobalLeaderboard();
  const { data: weeklyData, isPending: weeklyPending } = useWeeklyLeaderboard();

  const data = type === "all-time" ? globalData : weeklyData;
  const isPending = type === "all-time" ? globalPending : weeklyPending;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Classement</h2>
        <ToggleGroup
          type="single"
          value={type}
          onValueChange={(v) => v && setType(v as "all-time" | "weekly")}
        >
          <ToggleGroupItem value="all-time" className="text-xs">
            Global
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="text-xs">
            Semaine
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {data?.myRank && (
        <Card>
          <CardContent className="flex items-center gap-3 p-3">
            <Trophy className="size-5 text-primary" />
            <span className="text-sm">
              Votre position : <strong>#{data.myRank}</strong>
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-2">
          {isPending ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Pas encore de classement.
            </p>
          ) : (
            <div className="space-y-1">
              {data?.entries.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  highlight={entry.rank === data.myRank}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

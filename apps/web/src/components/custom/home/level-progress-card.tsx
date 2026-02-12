"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useMyLevel } from "@/hooks/use-gamification-queries";

export function LevelProgressCard() {
  const { data: level, isPending } = useMyLevel();

  if (isPending) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!level) return null;

  return (
    <Link href="/app/progression">
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="size-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Niveau {level.currentLevel}</p>
              <p className="text-xs text-muted-foreground">{level.totalAces} aces</p>
            </div>
            <Progress value={level.progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {level.acesInCurrentLevel} / {level.acesForNextLevel} pour le prochain niveau
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

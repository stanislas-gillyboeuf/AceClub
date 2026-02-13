"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useMyLevel } from "@/hooks/use-gamification-queries";

export function LevelProgressCard() {
  const { data: level, isPending } = useMyLevel();

  if (isPending) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  if (!level) return null;

  const isMaxLevel = level.acesForNextLevel === 0;

  return (
    <Link href="/app/progression">
      <Card className="p-4 transition-all hover:scale-[0.98] hover:opacity-90 active:scale-[0.97] cursor-pointer">
        <div className="space-y-4">
          {/* Header: level name + badge */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xl font-bold">Niveau {level.currentLevel}</p>
              <p className="text-sm text-muted-foreground">{level.totalAces} aces au total</p>
            </div>

            {/* Level badge circle */}
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-[3px] ring-primary">
              <span className="text-2xl font-bold text-primary tabular-nums">
                {level.currentLevel}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {!isMaxLevel && (
            <div className="space-y-2">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${Math.min(level.progressPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {level.acesInCurrentLevel} / {level.acesForNextLevel} aces
                </p>
                <p className="text-xs font-medium text-primary">Niveau {level.currentLevel + 1}</p>
              </div>
            </div>
          )}

          {/* Detail indicator */}
          <div className="space-y-3">
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Voir ma progression</span>
              <ChevronRight className="size-4 text-primary/60" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

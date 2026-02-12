"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Target } from "lucide-react";
import {
  useMyLevel,
  useMyStreak,
  useMyChallenges,
  useAllBadges,
} from "@/hooks/use-gamification-queries";

export default function ProgressionPage() {
  const { data: level, isPending: levelPending } = useMyLevel();
  const { data: streak, isPending: streakPending } = useMyStreak();
  const { data: challenges, isPending: challengesPending } = useMyChallenges();
  const { data: badgesData, isPending: badgesPending } = useAllBadges();
  const badges = badgesData?.badges ?? [];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Progression</h2>

      {/* Level Card */}
      {levelPending ? (
        <Skeleton className="h-28 w-full" />
      ) : level ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="size-7 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Niveau {level.currentLevel}</h3>
                  <span className="text-sm text-muted-foreground">{level.totalAces} aces</span>
                </div>
                <Progress value={level.progressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {level.acesInCurrentLevel} / {level.acesForNextLevel} pour le niveau{" "}
                  {level.currentLevel + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Streak Card */}
      {streakPending ? (
        <Skeleton className="h-20 w-full" />
      ) : streak ? (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10">
              <Flame className="size-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold">
                {streak.currentStreak} semaine{streak.currentStreak > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Record : {streak.longestStreak} | Total actif : {streak.totalActiveWeeks}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Challenges */}
      {challengesPending ? (
        <Skeleton className="h-32 w-full" />
      ) : challenges?.active && challenges.active.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4" />
              Défis de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.active.map((c) => {
              const progress = c.targetValue > 0 ? (c.currentProgress / c.targetValue) * 100 : 0;
              return (
                <div key={c.challengeId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{c.templateTitleFr}</span>
                    <Badge variant="outline" className="text-[10px]">
                      +{c.acesAwarded ?? "?"} aces
                    </Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">
                    {c.currentProgress} / {c.targetValue}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* Badges Grid */}
      {badgesPending ? (
        <Skeleton className="h-40 w-full" />
      ) : badges && badges.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Badges ({badges.filter((b) => b.isUnlocked).length}/{badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1 ${!badge.isUnlocked ? "opacity-30" : ""}`}
                >
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.name} className="size-10 rounded-full" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                      🏆
                    </div>
                  )}
                  <span className="text-[10px] text-center text-muted-foreground truncate w-full">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

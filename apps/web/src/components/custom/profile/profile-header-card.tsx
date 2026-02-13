"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, usePreferences } from "@/hooks/use-user-queries";
import { useMyLevel } from "@/hooks/use-gamification-queries";
import { useMatches } from "@/hooks/use-match-queries";
import { useSession } from "@/lib/auth-client";

function formatPlayTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  if (hours === 0) return `${totalMinutes}min`;
  return `${hours}h`;
}

export function ProfileHeaderCard() {
  const { data: me, isPending: mePending } = useMe();
  const { data: prefs } = usePreferences();
  const { data: level } = useMyLevel();
  const { data: session } = useSession();
  const { data: matchData } = useMatches({ status: "finished", limit: 200 });

  if (mePending) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  if (!me) return null;

  const finishedMatches = matchData?.matches ?? [];
  const userId = session?.user?.id;
  const totalMatches = finishedMatches.length;
  const wins = finishedMatches.filter((m) =>
    m.participants.some((p) => p.userId === userId && p.isWinner),
  ).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const totalPlayMinutes = finishedMatches.reduce((sum, m) => {
    if (m.startedAt && m.finishedAt) {
      const diff = new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime();
      return sum + Math.round(diff / 60000);
    }
    return sum;
  }, 0);

  const isMaxLevel = level ? level.acesForNextLevel === 0 : false;

  // Subtitle parts
  const subtitle = [
    prefs?.sport === "padel" ? "Padel" : "Tennis",
    prefs?.skillLevel,
    prefs?.organizationName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Top: Avatar + Name + Level subtitle */}
        <div className="flex items-center gap-4">
          <Avatar className="size-[72px] ring-2 ring-primary/20">
            <AvatarImage src={me.image ?? undefined} />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {me.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{me.name}</h2>
            {level && (
              <p className="text-sm text-primary font-medium">
                Niveau {level.currentLevel}
                {prefs?.organizationName && (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · {prefs.organizationName}
                  </span>
                )}
              </p>
            )}
            {!level && subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Level progress bar */}
        {level && !isMaxLevel && (
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${Math.min(level.progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {level.acesInCurrentLevel} / {level.acesForNextLevel} aces → Niveau{" "}
              {level.currentLevel + 1}
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="h-px bg-border" />
        <div className="grid grid-cols-3 gap-1">
          <Link href="/app/matches" className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold tabular-nums">{totalMatches}</span>
            <span className="text-[11px] text-muted-foreground">Matchs</span>
          </Link>
          <div className="flex flex-col items-center gap-0.5 border-x border-border">
            <span className="text-xl font-bold tabular-nums">{winRate}%</span>
            <span className="text-[11px] text-muted-foreground">Victoires</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold tabular-nums">
              {formatPlayTime(totalPlayMinutes)}
            </span>
            <span className="text-[11px] text-muted-foreground">Temps de jeu</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBadges } from "@/hooks/use-gamification-queries";

export function ProfileBadgesSection() {
  const { data, isPending } = useMyBadges();
  const badges = data?.badges ?? [];

  if (isPending) {
    return <Skeleton className="h-32 w-full" />;
  }

  // All badges from /reward/badges are already unlocked
  const unlockedBadges = badges;

  if (unlockedBadges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Jouez des matchs pour débloquer vos premiers badges !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Badges ({unlockedBadges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {unlockedBadges.slice(0, 8).map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-1">
              {badge.imageUrl ? (
                <img src={badge.imageUrl} alt={badge.name} className="size-10 rounded-full" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-lg">
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
  );
}

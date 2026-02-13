"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useMyBadges } from "@/hooks/use-gamification-queries";

export function ProfileBadgesSection() {
  const { data, isPending } = useMyBadges();
  const badges = data?.badges ?? [];

  if (isPending) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  const unlockedBadges = badges;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Badges
        </h3>
        {unlockedBadges.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {unlockedBadges.length} débloqué{unlockedBadges.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Card className="p-4">
        {unlockedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Jouez des matchs pour débloquer vos premiers badges !
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {unlockedBadges.slice(0, 4).map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-1.5">
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.name} className="size-12 rounded-full" />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                      🏆
                    </div>
                  )}
                  <span className="text-[10px] text-center text-muted-foreground truncate w-full leading-tight">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>

            {unlockedBadges.length > 4 && (
              <>
                <div className="h-px bg-border" />
                <Link
                  href="/app/progression"
                  className="flex items-center justify-between text-sm text-primary font-medium"
                >
                  <span>Voir tous les badges</span>
                  <ChevronRight className="size-4 text-primary/60" />
                </Link>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

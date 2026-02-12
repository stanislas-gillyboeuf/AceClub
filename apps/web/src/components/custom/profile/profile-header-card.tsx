"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-user-queries";
import { usePreferences } from "@/hooks/use-user-queries";
import { useMyLevel } from "@/hooks/use-gamification-queries";
import { useMyStreak } from "@/hooks/use-gamification-queries";

export function ProfileHeaderCard() {
  const { data: me, isPending: mePending } = useMe();
  const { data: prefs } = usePreferences();
  const { data: level } = useMyLevel();
  const { data: streak } = useMyStreak();

  if (mePending) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!me) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="size-20">
            <AvatarImage src={me.image ?? undefined} />
            <AvatarFallback className="text-2xl">
              {me.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{me.name}</h2>
            {prefs && (
              <p className="text-sm text-muted-foreground">
                {prefs.sport === "padel" ? "Padel" : "Tennis"} - {prefs.skillLevel}
                {prefs.organizationName && ` - ${prefs.organizationName}`}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {level && <Badge variant="secondary">Niveau {level.currentLevel}</Badge>}
            {streak && streak.currentStreak > 0 && (
              <Badge variant="outline">{streak.currentStreak} semaines</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

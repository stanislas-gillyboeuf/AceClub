"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, X } from "lucide-react";
import { useDiscoverFeed } from "@/hooks/use-match-queries";
import { useSwipeIntent } from "@/hooks/use-match-mutations";
import type { MatchIntent } from "@/types/match";

function DiscoverCard({ intent }: { intent: MatchIntent }) {
  const swipe = useSwipeIntent();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={intent.user?.image ?? undefined} />
            <AvatarFallback>{intent.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{intent.user?.name}</p>
            <p className="text-xs text-muted-foreground">Niveau {intent.user?.level ?? 1}</p>
          </div>
          <Badge variant="outline">{intent.type === "double" ? "Double" : "Simple"}</Badge>
        </div>
        {intent.description && (
          <p className="text-sm text-muted-foreground">{intent.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {intent.date
              ? new Date(intent.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "Date flexible"}
          </span>
          {intent.distance != null && <span>{Number(intent.distance).toFixed(1)} km</span>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => swipe.mutate({ intentId: intent.id, direction: "pass" })}
            disabled={swipe.isPending}
          >
            <X className="mr-1 size-4" />
            Passer
          </Button>
          <Button
            className="flex-1"
            onClick={() => swipe.mutate({ intentId: intent.id, direction: "like" })}
            disabled={swipe.isPending}
          >
            <ThumbsUp className="mr-1 size-4" />
            Jouer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiscoverFeed() {
  const { data, isPending } = useDiscoverFeed();
  const intents = data?.data ?? [];

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (intents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Aucune disponibilité à proximité pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {intents.map((intent) => (
        <DiscoverCard key={intent.id} intent={intent} />
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  X,
  HandMetal,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Timer,
  Users,
  CircleDot,
  Star,
  Diamond,
  Plus,
} from "lucide-react";
import { useDiscoverFeed } from "@/hooks/use-match-queries";
import { useSwipeIntent } from "@/hooks/use-match-mutations";
import type { MatchIntent } from "@/types/match";

// Level tier system matching iOS
function getTier(level: number) {
  if (level <= 10)
    return {
      name: "Bronze",
      color: "text-amber-700",
      bg: "bg-amber-700",
      bgLight: "bg-amber-700/10",
      icon: CircleDot,
    };
  if (level <= 25)
    return {
      name: "Argent",
      color: "text-gray-400",
      bg: "bg-gray-400",
      bgLight: "bg-gray-400/10",
      icon: CircleDot,
    };
  if (level <= 50)
    return {
      name: "Or",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      bgLight: "bg-yellow-500/10",
      icon: Star,
    };
  if (level <= 75)
    return {
      name: "Platine",
      color: "text-gray-300",
      bg: "bg-gray-300",
      bgLight: "bg-gray-300/10",
      icon: Diamond,
    };
  return {
    name: "Diamant",
    color: "text-sky-300",
    bg: "bg-sky-300",
    bgLight: "bg-sky-300/10",
    icon: Diamond,
  };
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  }
  return `${minutes}min`;
}

function formatDistance(km: number | null | undefined): string {
  if (km == null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// Tag pill (like iOS tagView)
function TagPill({
  icon: Icon,
  text,
  iconClassName,
}: {
  icon: React.ElementType;
  text: string;
  iconClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
      <Icon className={`size-3 ${iconClassName ?? "text-white/90"}`} />
      <span className="text-xs font-semibold text-white">{text}</span>
    </span>
  );
}

// The discover card (matching iOS DiscoverCardView)
function DiscoverCard({
  intent,
  isTop,
  stackIndex,
  onTap,
}: {
  intent: MatchIntent;
  isTop: boolean;
  stackIndex: number;
  onTap: () => void;
}) {
  const level = intent.user?.level ?? 1;
  const tier = getTier(level);
  const TierIcon = tier.icon;
  const name = intent.user?.name ?? "Joueur";
  const image = intent.user?.image;

  const scale = 1 - stackIndex * 0.04;
  const offsetY = stackIndex * 8;

  return (
    <div
      className="absolute inset-0 transition-all duration-300"
      style={{
        transform: `scale(${scale}) translateY(${offsetY}px)`,
        zIndex: 10 - stackIndex,
        pointerEvents: isTop ? "auto" : "none",
      }}
    >
      <div
        className="relative h-full w-full cursor-pointer overflow-hidden rounded-3xl shadow-xl"
        onClick={isTop ? onTap : undefined}
      >
        {/* Photo or gradient fallback */}
        {image ? (
          <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br from-amber-700/70 to-amber-700/30`}>
            <div className="flex h-full items-center justify-center">
              <span className="text-7xl font-bold text-white/60">{getInitials(name)}</span>
            </div>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {intent.distance != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur-md">
              <MapPin className="size-3 text-white" />
              <span className="text-xs font-semibold text-white">
                {formatDistance(intent.distance)}
              </span>
            </span>
          )}
          <div className="ml-auto">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                intent.type === "simple" ? "bg-blue-500/85" : "bg-orange-500/85"
              }`}
            >
              {intent.type === "simple" ? "Match" : "Entraînement"}
            </span>
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="space-y-2.5">
            <p className="text-xl font-bold text-white">{name}</p>
            <div className="flex flex-wrap gap-1.5">
              <TagPill icon={TierIcon} text={`Niv. ${level}`} iconClassName={tier.color} />
              {intent.user?.organization && (
                <TagPill icon={Building2} text={intent.user.organization.name} />
              )}
              {intent.date && <TagPill icon={Calendar} text={formatDate(intent.date)} />}
              {intent.time && <TagPill icon={Clock} text={formatTime(intent.time)} />}
              {intent.duration && intent.duration > 0 && (
                <TagPill icon={Timer} text={formatDuration(intent.duration)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail sheet (matching iOS DiscoverIntentDetailSheet)
function IntentDetailDialog({
  intent,
  open,
  onOpenChange,
  onLike,
  onPass,
}: {
  intent: MatchIntent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: () => void;
  onPass: () => void;
}) {
  const level = intent.user?.level ?? 1;
  const tier = getTier(level);
  const TierIcon = tier.icon;
  const name = intent.user?.name ?? "Joueur";
  const image = intent.user?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        {/* Hero photo */}
        <div className="relative h-80 w-full">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-700/70 to-amber-700/30">
              <span className="text-7xl font-bold text-white/60">{getInitials(name)}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="space-y-5 p-5">
          {/* Profile info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{name}</h3>
              <div className="flex items-center gap-1">
                <TierIcon className={`size-4 ${tier.color}`} />
                <span className="text-sm font-semibold text-muted-foreground">Niv. {level}</span>
              </div>
            </div>

            {intent.user?.organization && (
              <div className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {intent.user.organization.name}
                </span>
              </div>
            )}

            {intent.distance != null && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" />
                <span className="text-sm font-medium">{formatDistance(intent.distance)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Availability section */}
          <div className="space-y-4">
            <h4 className="font-semibold">Disponibilité</h4>
            <Card className="p-3">
              <div className="space-y-3">
                <DetailRow
                  icon={
                    intent.type === "simple" ? (
                      <Users className="size-4 text-primary" />
                    ) : (
                      <Users className="size-4 text-primary" />
                    )
                  }
                  label="Type"
                  value={intent.type === "simple" ? "Match" : "Entraînement"}
                />
                {intent.date && (
                  <DetailRow
                    icon={<Calendar className="size-4 text-primary" />}
                    label="Date"
                    value={new Date(intent.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  />
                )}
                {intent.time && (
                  <DetailRow
                    icon={<Clock className="size-4 text-primary" />}
                    label="Heure"
                    value={formatTime(intent.time)}
                  />
                )}
                {intent.duration && intent.duration > 0 && (
                  <DetailRow
                    icon={<Timer className="size-4 text-primary" />}
                    label="Durée"
                    value={formatDuration(intent.duration)}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Description */}
          {intent.description && (
            <div className="space-y-3">
              <h4 className="font-semibold">Note</h4>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">{intent.description}</p>
              </Card>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="size-14 shrink-0 rounded-full border-2"
              onClick={() => {
                onPass();
                onOpenChange(false);
              }}
            >
              <X className="size-6 text-destructive" />
            </Button>
            <Button
              className="h-14 flex-1 gap-2 rounded-full text-base font-semibold"
              onClick={() => {
                onLike();
                onOpenChange(false);
              }}
            >
              <HandMetal className="size-5" />
              Proposer un match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-5 justify-center">{icon}</div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  );
}

// Match banner
function MatchBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5">
      <span className="text-lg">👏</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function DiscoverFeed() {
  const { data, isPending } = useDiscoverFeed();
  const swipe = useSwipeIntent();
  const [selectedIntent, setSelectedIntent] = useState<MatchIntent | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);

  const intents = data?.data ?? [];

  const handleLike = useCallback(() => {
    if (intents.length === 0) return;
    const top = intents[0];
    swipe.mutate(
      { intentId: top.id, direction: "like" },
      {
        onSuccess: (result: unknown) => {
          const res = result as { message?: string; matchRequest?: unknown };
          if (res?.matchRequest) {
            setMatchMessage(res.message ?? "C'est un match !");
            setTimeout(() => setMatchMessage(null), 3000);
          }
        },
      },
    );
  }, [intents, swipe]);

  const handlePass = useCallback(() => {
    if (intents.length === 0) return;
    const top = intents[0];
    swipe.mutate({ intentId: top.id, direction: "pass" });
  }, [intents, swipe]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="aspect-[0.7] w-full max-w-sm rounded-3xl" />
        <div className="flex gap-12">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="size-18 rounded-full" />
        </div>
      </div>
    );
  }

  if (intents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Match banner */}
      {matchMessage && <MatchBanner message={matchMessage} />}

      {/* Card stack */}
      <div className="relative aspect-[0.7] w-full max-w-sm">
        {intents.slice(0, 3).map((intent, index) => (
          <DiscoverCard
            key={intent.id}
            intent={intent}
            isTop={index === 0}
            stackIndex={index}
            onTap={() => setSelectedIntent(intent)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-12">
        <Button
          variant="outline"
          size="icon"
          className="size-16 rounded-full border-2 shadow-md transition-transform hover:scale-105 active:scale-95"
          onClick={handlePass}
          disabled={swipe.isPending}
        >
          <X className="size-7 text-muted-foreground" />
        </Button>
        <Button
          size="icon"
          className="size-[72px] rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          onClick={handleLike}
          disabled={swipe.isPending}
        >
          <HandMetal className="size-8" />
        </Button>
      </div>

      {/* Detail dialog */}
      {selectedIntent && (
        <IntentDetailDialog
          intent={selectedIntent}
          open={!!selectedIntent}
          onOpenChange={(open) => !open && setSelectedIntent(null)}
          onLike={() => {
            handleLike();
            setSelectedIntent(null);
          }}
          onPass={() => {
            handlePass();
            setSelectedIntent(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Users className="size-10 text-muted-foreground/40" />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-medium">Plus de profils pour l'instant</p>
        <p className="text-sm text-muted-foreground">
          Reviens plus tard pour découvrir de nouveaux joueurs
        </p>
      </div>
    </div>
  );
}

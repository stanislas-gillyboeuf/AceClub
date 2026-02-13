"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useMatchIntents } from "@/hooks/use-match-queries";
import { useDeleteMatchIntent } from "@/hooks/use-match-mutations";
import { CreateIntentDialog } from "@/components/custom/discover/create-intent-dialog";

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

function IntentRow({
  intent,
  onDelete,
  deleting,
}: {
  intent: {
    id: string;
    type: string;
    date: string | null;
    time: string | null;
    duration: number | null;
  };
  onDelete: () => void;
  deleting: boolean;
}) {
  const date = intent.date ? new Date(intent.date) : null;
  const dayNum = date ? date.getDate() : null;
  const monthShort = date
    ? date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()
    : null;

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Date icon */}
      {date ? (
        <div className="flex size-11 flex-col items-center justify-center rounded-lg bg-primary/10">
          <span className="text-sm font-bold leading-none text-primary tabular-nums">{dayNum}</span>
          <span className="text-[9px] font-medium text-primary/70">{monthShort}</span>
        </div>
      ) : (
        <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
          <Calendar className="size-4 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              intent.type === "double"
                ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 text-[10px]"
                : "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px]"
            }
          >
            {intent.type === "double" ? "Double" : "Simple"}
          </Badge>
          {intent.time && <span className="text-xs text-muted-foreground">{intent.time}</span>}
        </div>
        {intent.duration && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{formatDuration(intent.duration)}</span>
          </div>
        )}
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        disabled={deleting}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function MyIntentsList() {
  const { data, isPending } = useMatchIntents();
  const intents = data?.data ?? [];
  const deleteIntent = useDeleteMatchIntent();
  const [showCreate, setShowCreate] = useState(false);

  if (isPending) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mes disponibilités
        </h3>
      </div>

      <Card className="p-4 space-y-1">
        {/* Create button */}
        <Button
          variant="outline"
          className="w-full gap-1.5 mb-2"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="size-4" />
          Publier ma dispo
        </Button>

        {/* Intent list */}
        {intents.length > 0 && (
          <div className="divide-y">
            {intents.map((intent) => (
              <IntentRow
                key={intent.id}
                intent={intent}
                onDelete={() => deleteIntent.mutate(intent.id)}
                deleting={deleteIntent.isPending}
              />
            ))}
          </div>
        )}

        {intents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Aucune disponibilité publiée
          </p>
        )}
      </Card>

      <CreateIntentDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}

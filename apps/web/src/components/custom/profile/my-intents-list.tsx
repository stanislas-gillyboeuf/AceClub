"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchIntents } from "@/hooks/use-match-queries";
import { useDeleteMatchIntent } from "@/hooks/use-match-mutations";

export function MyIntentsList() {
  const { data, isPending } = useMatchIntents();
  const intents = data?.data ?? [];
  const deleteIntent = useDeleteMatchIntent();

  if (isPending) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (intents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mes disponibilités</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {intents.map((intent) => (
          <div key={intent.id} className="flex items-center justify-between rounded-md border p-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {intent.type === "double" ? "Double" : "Simple"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {intent.date
                    ? new Date(intent.date).toLocaleDateString("fr-FR")
                    : "Date flexible"}
                </span>
              </div>
              {intent.description && (
                <p className="text-xs text-muted-foreground mt-1">{intent.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteIntent.mutate(intent.id)}
              disabled={deleteIntent.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/hooks/use-event-queries";
import type { Event } from "@/types/event";

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/app/events/${event.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{event.title}</h3>
            <Badge
              variant={event.status === "published" ? "default" : "secondary"}
              className="text-[10px]"
            >
              {event.status === "published" ? "Ouvert" : event.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{event.organizationName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(event.startAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {event.currentParticipants}
              {event.maxParticipants ? `/${event.maxParticipants}` : ""}
            </span>
          </div>
          {event.sport && (
            <Badge variant="outline" className="text-[10px]">
              {event.sport === "padel" ? "Padel" : "Tennis"}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EventsPage() {
  const { data, isPending } = useEvents({ limit: 50 });
  const events = data?.events ?? [];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Événements</h2>
      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Aucun événement à venir.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

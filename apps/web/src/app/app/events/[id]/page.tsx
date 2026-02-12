"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users } from "lucide-react";
import { useEvent, useEventParticipants } from "@/hooks/use-event-queries";
import { useRegisterEvent, useCancelRegistration } from "@/hooks/use-event-mutations";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: event, isPending } = useEvent(id);
  const { data: participantsData } = useEventParticipants(id);
  const registerEvent = useRegisterEvent();
  const cancelRegistration = useCancelRegistration();

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Événement introuvable.</p>
      </div>
    );
  }

  const participants = participantsData?.participants ?? [];
  const isFull = event.maxParticipants ? event.currentParticipants >= event.maxParticipants : false;

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status === "published" ? "Ouvert" : event.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{event.organizationName}</p>

          {event.description && <p className="text-sm">{event.description}</p>}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>
                {new Date(event.startAt).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>
                {event.currentParticipants} participant{event.currentParticipants > 1 ? "s" : ""}
                {event.maxParticipants ? ` / ${event.maxParticipants} max` : ""}
              </span>
            </div>
          </div>

          {event.status === "published" &&
            (event.isRegistered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => cancelRegistration.mutate({ eventId: event.id })}
                disabled={cancelRegistration.isPending}
              >
                Se désinscrire
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => registerEvent.mutate({ eventId: event.id })}
                disabled={registerEvent.isPending || isFull}
              >
                {isFull ? "Complet" : "S'inscrire"}
              </Button>
            ))}
        </CardContent>
      </Card>

      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={p.userImage ?? undefined} />
                  <AvatarFallback className="text-[10px]">{p.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{p.userName}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

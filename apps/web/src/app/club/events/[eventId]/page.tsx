"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/custom/data-table"
import { getClubEventParticipantsColumns } from "@/components/custom/club-event-participants-columns"
import { AddEventParticipant } from "@/components/custom/add-event-participant"
import { useOrganizationEvents, useEventParticipants } from "@/hooks/use-event-queries"
import {
  useUpdateEventStatus,
  useDeleteEvent,
  useCancelEvent,
  useRemoveEventParticipant,
} from "@/hooks/use-event-mutations"
import { useTournaments } from "@/hooks/use-tournament-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { EventStatus, EventParticipant } from "@/types/event"

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "presale", label: "Prévente" },
  { value: "on_sale", label: "Ouvert" },
  { value: "full", label: "Complet" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
  { value: "archived", label: "Archivé" },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ClubEventDetailPage() {
  const router = useRouter()
  const params = useParams<{ eventId: string }>()
  const { organizationId } = useClubAdminContext()
  const { data: events, isLoading } = useOrganizationEvents(organizationId)
  const { data: participants, isLoading: participantsLoading } = useEventParticipants(params.eventId)
  const { data: tournamentsData } = useTournaments(organizationId)
  const updateStatus = useUpdateEventStatus()
  const deleteEvent = useDeleteEvent()
  const cancelEvent = useCancelEvent()
  const removeParticipant = useRemoveEventParticipant()

  const event = useMemo(() => events?.find((e) => e.id === params.eventId), [events, params.eventId])
  const tournament = useMemo(
    () => tournamentsData?.tournaments.find((t) => t.eventId === params.eventId),
    [tournamentsData, params.eventId],
  )

  const columns = getClubEventParticipantsColumns(
    (p: EventParticipant) => removeParticipant.mutate({ eventId: params.eventId, userId: p.userId }),
    removeParticipant.isPending ? removeParticipant.variables?.userId : undefined,
  )

  const activeParticipantUserIds = useMemo(
    () => new Set((participants ?? []).filter((p) => p.status !== "cancelled").map((p) => p.userId)),
    [participants],
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!event) {
    return <p className="text-sm text-muted-foreground">Événement introuvable.</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/events")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux événements
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
        {tournament ? (
          <Button asChild>
            <Link href={`/club/tournaments/${tournament.id}`}>
              <Trophy className="mr-2 h-4 w-4" />
              Gérer le tableau
            </Link>
          </Button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatDate(event.startDate)} — {formatDate(event.endDate)}
        {event.address ? ` · ${event.address}` : ""}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={event.status}
              disabled={updateStatus.isPending}
              onValueChange={(status: EventStatus) =>
                updateStatus.mutate({ eventId: event.id, status })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updateStatus.isError ? (
              <p className="text-sm text-destructive">{updateStatus.error.message}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {event.participantCount} inscrit{event.participantCount > 1 ? "s" : ""}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
              {event.waitlistCount > 0 ? ` · ${event.waitlistCount} en liste d'attente` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddEventParticipant
            eventId={event.id}
            organizationId={organizationId}
            existingUserIds={activeParticipantUserIds}
          />
          <DataTable<EventParticipant, unknown>
            columns={columns}
            data={participants ?? []}
            isLoading={participantsLoading}
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Annuler l&apos;événement</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler cet événement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Tous les inscrits seront notifiés annulés. L&apos;événement reste consultable mais
                fermé aux inscriptions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Retour</AlertDialogCancel>
              <AlertDialogAction onClick={() => cancelEvent.mutate(event.id)}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Supprimer l&apos;événement</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Supprime l&apos;événement et toutes les inscriptions{tournament ? " ainsi que son tournoi" : ""}.
                Action irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteEvent.mutate(event.id, { onSuccess: () => router.push("/club/events") })
                }
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

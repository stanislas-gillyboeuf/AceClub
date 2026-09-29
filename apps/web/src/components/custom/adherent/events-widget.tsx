"use client"

import { useMemo, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdherentEvents, useMyEventRegistrations } from "@/hooks/use-adherent-queries"
import { useAdherentCancelEventRegistration, useAdherentRegisterEvent } from "@/hooks/use-adherent-mutations"
import type { AdherentEvent, AdherentEventRegistrationStatus } from "@/types/adherent"

const STATUS_LABELS: Record<AdherentEvent["status"], string> = {
  draft: "Brouillon",
  presale: "Prévente",
  on_sale: "En vente",
  completed: "Terminé",
  full: "Complet",
  cancelled: "Annulé",
  archived: "Archivé",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface EventCardProps {
  event: AdherentEvent
}

function EventCard({ event }: EventCardProps) {
  const registerMutation = useAdherentRegisterEvent()
  const cancelMutation = useAdherentCancelEventRegistration()
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const isMutating = registerMutation.isPending || cancelMutation.isPending
  const status: AdherentEventRegistrationStatus = event.userRegistrationStatus

  const handleRegister = () => {
    if (!event.isFree && event.paymentLink) {
      window.open(event.paymentLink, "_blank", "noopener,noreferrer")
    }
    registerMutation.mutate(event.id)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{event.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(event.startDate)}</p>
          {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
        </div>
        <Badge variant="secondary">{STATUS_LABELS[event.status]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {event.participantCount} inscrit{event.participantCount !== 1 ? "s" : ""}
          {event.maxParticipants ? ` / ${event.maxParticipants} places` : ""}
          {!event.isFree && (event.price != null ? ` · ${event.price} €` : " · Payant")}
        </p>
        {status === "registered" ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              disabled={isMutating}
              onClick={() => setConfirmCancelOpen(true)}
            >
              Annuler l&apos;inscription
            </Button>
            <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler l&apos;inscription ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous ne serez plus inscrit à « {event.name} ».
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Non</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cancelMutation.mutate(event.id)}>
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : status === "waitlisted" ? (
          <Button size="sm" disabled>
            Sur liste d&apos;attente
          </Button>
        ) : (
          <Button size="sm" disabled={isMutating} onClick={handleRegister}>
            {!event.isFree && event.paymentLink ? "S'inscrire et payer" : "S'inscrire"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface EventsWidgetProps {
  organizationId: string
}

export function EventsWidget({ organizationId }: EventsWidgetProps) {
  const { data: eventsData, isLoading } = useAdherentEvents(organizationId)
  const { data: myRegistrations } = useMyEventRegistrations(true)

  const events = useMemo<AdherentEvent[]>(() => {
    const raw = eventsData?.data ?? []
    const statusByEventId = new Map((myRegistrations ?? []).map((r) => [r.id, r.registrationStatus]))
    return raw.map((e) => ({ ...e, userRegistrationStatus: statusByEventId.get(e.id) ?? null }))
  }, [eventsData, myRegistrations])

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Événements</h2>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun événement à venir pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}

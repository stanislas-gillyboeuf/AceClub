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
    <Card className="rounded-2xl border-adh-border bg-adh-card shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-extrabold text-adh-fg">{event.name}</CardTitle>
          <p className="mt-1 text-sm text-adh-fg-dim">{formatDate(event.startDate)}</p>
          {event.address && <p className="text-sm text-adh-fg-dim">{event.address}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-adh-bg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-adh-fg-dim">
          {STATUS_LABELS[event.status]}
        </span>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-adh-fg-dim">
          {event.participantCount} inscrit{event.participantCount !== 1 ? "s" : ""}
          {event.maxParticipants ? ` / ${event.maxParticipants} places` : ""}
          {!event.isFree && (event.price != null ? ` · ${event.price} €` : " · Payant")}
        </p>
        {status === "registered" ? (
          <>
            <Button
              disabled={isMutating}
              onClick={() => setConfirmCancelOpen(true)}
              className="h-9 rounded-full border border-adh-danger/30 bg-transparent px-4 text-sm font-bold text-adh-danger hover:bg-adh-danger/10"
            >
              Annuler l&apos;inscription
            </Button>
            <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
              <AlertDialogContent className="rounded-3xl border-adh-border bg-adh-card text-adh-fg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-adh-fg">Annuler l&apos;inscription ?</AlertDialogTitle>
                  <AlertDialogDescription className="text-adh-fg-dim">
                    Vous ne serez plus inscrit à « {event.name} ».
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full border-adh-border bg-transparent text-adh-fg hover:bg-adh-bg">
                    Non
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate(event.id)}
                    className="rounded-full bg-adh-danger font-bold text-white hover:bg-adh-danger/90"
                  >
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : status === "waitlisted" ? (
          <Button disabled className="h-9 rounded-full bg-adh-border px-4 text-sm font-bold text-adh-fg-dim">
            Sur liste d&apos;attente
          </Button>
        ) : (
          <Button
            disabled={isMutating}
            onClick={handleRegister}
            className="h-9 rounded-full bg-adh-accent px-4 text-sm font-bold text-adh-accent-foreground hover:bg-adh-accent/90"
          >
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
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-adh-fg-dim">Événements</h2>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl bg-adh-border/60" />
          <Skeleton className="h-24 w-full rounded-2xl bg-adh-border/60" />
        </div>
      ) : events.length === 0 ? (
        <Card className="rounded-2xl border-adh-border bg-adh-card shadow-none">
          <CardContent className="py-8 text-center text-sm text-adh-fg-dim">
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

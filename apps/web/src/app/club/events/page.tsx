"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateEventDialog } from "@/components/custom/club-event-actions"
import { CreateTournamentDialog } from "@/components/custom/create-tournament-dialog"
import { useOrganizationEvents } from "@/hooks/use-event-queries"
import { useTournaments } from "@/hooks/use-tournament-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  presale: { label: "Prévente", variant: "secondary" },
  on_sale: { label: "Ouvert", variant: "default" },
  full: { label: "Complet", variant: "secondary" },
  completed: { label: "Terminé", variant: "outline" },
  cancelled: { label: "Annulé", variant: "destructive" },
  archived: { label: "Archivé", variant: "outline" },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ClubEventsPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const { data: events, isLoading } = useOrganizationEvents(organizationId)
  const { data: tournamentsData } = useTournaments(organizationId)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false)

  const tournamentByEventId = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of tournamentsData?.tournaments ?? []) map.set(t.eventId, t.id)
    return map
  }, [tournamentsData])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateTournamentOpen(true)}>
            <Trophy className="mr-2 h-4 w-4" />
            Nouveau tournoi
          </Button>
          <Button onClick={() => setCreateEventOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !events?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun événement pour le moment.
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const status = STATUS_LABELS[event.status] ?? { label: event.status, variant: "outline" as const }
            const tournamentId = tournamentByEventId.get(event.id)
            return (
              <Card
                key={event.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => router.push(`/club/events/${event.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{event.name}</CardTitle>
                      {tournamentId ? (
                        <Badge variant="outline" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Tournoi
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(event.startDate)} · {event.participantCount} inscrit
                      {event.participantCount > 1 ? "s" : ""}
                      {event.waitlistCount > 0 ? ` · ${event.waitlistCount} en attente` : ""}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>

      <CreateEventDialog
        organizationId={organizationId}
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
      />
      <CreateTournamentDialog
        organizationId={organizationId}
        open={createTournamentOpen}
        onOpenChange={setCreateTournamentOpen}
      />
    </div>
  )
}

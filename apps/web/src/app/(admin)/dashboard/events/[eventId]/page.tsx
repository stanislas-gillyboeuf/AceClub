"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/custom/data-table"
import {
  buildEventParticipantsColumns,
  type ParticipantAction,
} from "@/components/custom/event-participants-columns"
import {
  RemoveParticipantDialog,
  UpdateParticipantStatusDialog,
} from "@/components/custom/event-participant-actions"
import { useAdminEventParticipants } from "@/hooks/use-admin-queries"
import { formatDateTime } from "@/lib/admin-format"
import type {
  AdminEvent,
  AdminEventParticipant,
  EventParticipantStatus,
} from "@/types/admin"

const PAGE_SIZE = 50

type StatusFilter = EventParticipantStatus | "all"

type DialogState = {
  kind: ParticipantAction
  participant: AdminEventParticipant
} | null

const eventStatusLabels: Record<AdminEvent["status"], string> = {
  draft: "Brouillon",
  presale: "Prévente",
  on_sale: "En vente",
  completed: "Terminé",
  full: "Complet",
  cancelled: "Annulé",
  archived: "Archivé",
}

function formatPrice(priceCents: number | null, isFree: boolean) {
  if (isFree) return "Gratuit"
  if (priceCents == null) return "Payant"
  return `${(priceCents / 100).toFixed(2)} €`
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const router = useRouter()
  const eventId = params.eventId

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [dialog, setDialog] = useState<DialogState>(null)

  const { data, isLoading } = useAdminEventParticipants({
    eventId,
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const event = data?.event

  const columns = useMemo(
    () =>
      buildEventParticipantsColumns({
        onAction: (participant, kind) => setDialog({ kind, participant }),
      }),
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux événements
        </Button>
      </div>

      {event && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{event.name}</CardTitle>
                {event.description && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {event.description}
                  </p>
                )}
              </div>
              <Badge variant="outline">
                {eventStatusLabels[event.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Début"
                value={formatDateTime(event.startDate)}
              />
              <InfoItem label="Fin" value={formatDateTime(event.endDate)} />
              <InfoItem
                label="Participants"
                value={
                  event.maxParticipants
                    ? `${event.participantCount} / ${event.maxParticipants}`
                    : String(event.participantCount)
                }
              />
              <InfoItem
                label="Tarification"
                value={formatPrice(event.price, event.isFree)}
              />
              {event.address && (
                <InfoItem label="Adresse" value={event.address} />
              )}
              <InfoItem
                label="Visibilité"
                value={
                  event.visibility === "public" ? "Public" : "Organisation"
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold">Inscrits</h2>
        <p className="text-muted-foreground text-sm">
          Gérer les participants à cet événement
        </p>
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v as StatusFilter)
          setPageIndex(0)
        }}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="registered">Inscrit</SelectItem>
          <SelectItem value="waitlisted">Liste d&apos;attente</SelectItem>
          <SelectItem value="cancelled">Annulé</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={data?.participants ?? []}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPageIndex,
        }}
      />

      {dialog?.kind === "change-status" && (
        <UpdateParticipantStatusDialog
          participant={dialog.participant}
          open
          onOpenChange={(v) => {
            if (!v) setDialog(null)
          }}
        />
      )}
      {dialog?.kind === "remove" && (
        <RemoveParticipantDialog
          participant={dialog.participant}
          open
          onOpenChange={(v) => {
            if (!v) setDialog(null)
          }}
        />
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

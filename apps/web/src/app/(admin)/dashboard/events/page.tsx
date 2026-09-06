"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/custom/data-table"
import { eventsColumns } from "@/components/custom/events-columns"
import {
  CreateEventDialog,
  UpdateEventStatusDialog,
  DeleteEventDialog,
} from "@/components/custom/event-actions"
import { useAdminEvents } from "@/hooks/use-admin-queries"
import type { AdminEvent } from "@/types/admin"

const PAGE_SIZE = 20

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setPageIndex(0)
  }, [statusFilter])

  const { data, isLoading } = useAdminEvents({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(statusFilter !== "all" && { status: statusFilter }),
  })

  const handleRowClick = (event: AdminEvent) => {
    setSelectedEvent(event)
    setStatusDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight">&Eacute;v&eacute;nements</h1>
        <p className="text-muted-foreground">
          G&eacute;rer les &eacute;v&eacute;nements de la plateforme
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="presale">Pr&eacute;vente</SelectItem>
            <SelectItem value="on_sale">En vente</SelectItem>
            <SelectItem value="completed">Termin&eacute;</SelectItem>
            <SelectItem value="full">Complet</SelectItem>
            <SelectItem value="cancelled">Annul&eacute;</SelectItem>
            <SelectItem value="archived">Archiv&eacute;</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel &eacute;v&eacute;nement
        </Button>
      </div>

      <DataTable
        columns={eventsColumns}
        data={data?.events ?? []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPageIndex,
        }}
      />

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedEvent && (
        <>
          <UpdateEventStatusDialog
            event={selectedEvent}
            open={statusDialogOpen}
            onOpenChange={(v) => {
              setStatusDialogOpen(v)
              if (!v) setSelectedEvent(null)
            }}
            onDelete={() => setDeleteDialogOpen(true)}
          />
          <DeleteEventDialog
            event={selectedEvent}
            open={deleteDialogOpen}
            onOpenChange={(v) => {
              setDeleteDialogOpen(v)
              if (!v) setSelectedEvent(null)
            }}
          />
        </>
      )}
    </div>
  )
}

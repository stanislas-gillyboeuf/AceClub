"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { AdminEvent } from "@/types/admin"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusLabels: Record<AdminEvent["status"], string> = {
  draft: "Brouillon",
  presale: "Pr\u00e9vente",
  on_sale: "En vente",
  completed: "Termin\u00e9",
  full: "Complet",
  cancelled: "Annul\u00e9",
  archived: "Archiv\u00e9",
}

const statusVariants: Record<AdminEvent["status"], "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  presale: "outline",
  on_sale: "default",
  completed: "outline",
  full: "secondary",
  cancelled: "destructive",
  archived: "secondary",
}

export const eventsColumns: ColumnDef<AdminEvent>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={statusVariants[status]}>
          {statusLabels[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "visibility",
    header: "Visibilit\u00e9",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.visibility === "public" ? "Public" : "Organisation"}
      </Badge>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Date",
    cell: ({ row }) => formatDateTime(row.original.startDate),
  },
  {
    accessorKey: "participantCount",
    header: "Participants",
    cell: ({ row }) => {
      const { participantCount, maxParticipants } = row.original
      return maxParticipants
        ? `${participantCount} / ${maxParticipants}`
        : String(participantCount)
    },
  },
  {
    accessorKey: "createdAt",
    header: "Cr\u00e9ation",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EventParticipant } from "@/types/event"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

const STATUS_LABELS: Record<string, string> = {
  registered: "Inscrit",
  waitlisted: "En attente",
  cancelled: "Annulé",
}

export function getClubEventParticipantsColumns(
  onRemove: (participant: EventParticipant) => void,
  removePendingId?: string,
): ColumnDef<EventParticipant>[] {
  return [
    {
      accessorKey: "userName",
      header: "Membre",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={p.userImage ?? undefined} alt={p.userName} />
              <AvatarFallback className="text-xs">{initials(p.userName)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{p.userName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "registered" ? "default" : "secondary"}>
          {STATUS_LABELS[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "registeredAt",
      header: "Inscrit le",
      cell: ({ row }) => formatDate(row.original.registeredAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original
        if (p.status === "cancelled") return null
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              disabled={removePendingId === p.userId}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(p)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}

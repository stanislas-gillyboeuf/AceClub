"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateTime, getInitials } from "@/lib/admin-format"
import type {
  AdminEventParticipant,
  EventParticipantStatus,
} from "@/types/admin"

const statusLabels: Record<EventParticipantStatus, string> = {
  registered: "Inscrit",
  waitlisted: "Liste d'attente",
  cancelled: "Annulé",
}

const statusVariants: Record<
  EventParticipantStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  registered: "default",
  waitlisted: "outline",
  cancelled: "destructive",
}

export type ParticipantAction = "change-status" | "remove"

export function buildEventParticipantsColumns(options: {
  onAction: (participant: AdminEventParticipant, action: ParticipantAction) => void
}): ColumnDef<AdminEventParticipant>[] {
  return [
    {
      accessorKey: "userName",
      header: "Participant",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={p.userImage ?? undefined} alt={p.userName} />
              <AvatarFallback className="text-xs">
                {getInitials(p.userName)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{p.userName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "userEmail",
      header: "Email",
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
      accessorKey: "registeredAt",
      header: "Inscription",
      cell: ({ row }) => formatDateTime(row.original.registeredAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    options.onAction(p, "change-status")
                  }}
                >
                  Changer le statut
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    options.onAction(p, "remove")
                  }}
                >
                  Retirer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

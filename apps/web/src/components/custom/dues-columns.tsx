"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { DuesAssignment } from "@/types/dues"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

const STATUS_BADGE: Record<DuesAssignment["status"], { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  paid: { label: "Payé", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  waived: { label: "Exonéré", className: "bg-muted text-muted-foreground" },
}

interface DuesColumnActions {
  onMarkPaid: (assignment: DuesAssignment) => void
  onWaive: (assignment: DuesAssignment) => void
  onRemind: (assignment: DuesAssignment) => void
  pendingId?: string
}

export function getDuesAssignmentColumns(actions: DuesColumnActions): ColumnDef<DuesAssignment>[] {
  return [
    {
      accessorKey: "userName",
      header: "Membre",
      cell: ({ row }) => {
        const a = row.original
        return (
          <Link href={`/club/members/${a.userId}`} className="flex items-center gap-3 hover:underline">
            <Avatar className="h-8 w-8">
              <AvatarImage src={a.userImage ?? undefined} alt={a.userName} />
              <AvatarFallback className="text-xs">{getInitials(a.userName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{a.userName}</span>
              <span className="text-xs text-muted-foreground">{a.userEmail}</span>
            </div>
          </Link>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const { label, className } = STATUS_BADGE[row.original.status]
        return <Badge className={className}>{label}</Badge>
      },
    },
    {
      accessorKey: "paidAt",
      header: "Payé le",
      cell: ({ row }) => (row.original.paidAt ? formatDate(row.original.paidAt) : "—"),
    },
    {
      accessorKey: "lastReminderAt",
      header: "Dernière relance",
      cell: ({ row }) =>
        row.original.lastReminderAt ? formatDate(row.original.lastReminderAt) : "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const a = row.original
        const isPending = actions.pendingId === a.id
        if (a.status !== "pending") return null
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                actions.onRemind(a)
              }}
            >
              Relancer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                actions.onWaive(a)
              }}
            >
              Exonérer
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                actions.onMarkPaid(a)
              }}
            >
              Marquer payé
            </Button>
          </div>
        )
      },
    },
  ]
}

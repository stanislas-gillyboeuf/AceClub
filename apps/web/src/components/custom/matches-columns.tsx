"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { AdminMatch } from "@/types/admin"

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "finished":
      return "default"
    case "ongoing":
      return "secondary"
    case "scheduled":
      return "outline"
    default:
      return "secondary"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "scheduled":
      return "Programmé"
    case "ongoing":
      return "En cours"
    case "finished":
      return "Terminé"
    default:
      return status
  }
}

function getScoreSummary(match: AdminMatch): string {
  if (match.sets.length === 0) return "-"

  const setsWon: Record<string, number> = {}
  for (const s of match.sets) {
    if (s.scores.length < 2) continue
    const sorted = [...s.scores].sort((a, b) => b.games - a.games)
    if (sorted[0].games > sorted[1].games) {
      setsWon[sorted[0].side] = (setsWon[sorted[0].side] ?? 0) + 1
    }
  }

  return `${setsWon["home"] ?? 0} - ${setsWon["away"] ?? 0}`
}

export const matchesColumns: ColumnDef<AdminMatch>[] = [
  {
    accessorKey: "participants",
    header: "Joueurs",
    cell: ({ row }) => {
      const m = row.original
      const home = m.participants.find((p) => p.side === "home")
      const away = m.participants.find((p) => p.side === "away")

      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={home?.user?.image ?? undefined}
                alt={home?.user?.name ?? "?"}
              />
              <AvatarFallback className="text-[10px]">
                {home?.user?.name ? getInitials(home.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[100px] truncate">
              {home?.user?.name ?? "Inconnu"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">vs</span>
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={away?.user?.image ?? undefined}
                alt={away?.user?.name ?? "?"}
              />
              <AvatarFallback className="text-[10px]">
                {away?.user?.name ? getInitials(away.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[100px] truncate">
              {away?.user?.name ?? "Inconnu"}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.type === "training" ? "Entraînement" : "Match"}</span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score (sets)",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{getScoreSummary(row.original)}</span>
    ),
  },
  {
    accessorKey: "scheduledAt",
    header: "Date",
    cell: ({ row }) => {
      const m = row.original
      const dateStr = m.finishedAt ?? m.startedAt ?? m.scheduledAt
      return <span className="text-sm">{formatDate(dateStr)}</span>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Création",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

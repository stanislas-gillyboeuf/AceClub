"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { ChallengeTemplate } from "@/types/admin"

const TYPE_LABELS: Record<string, string> = {
  quantitative: "Quantitatif",
  social: "Social",
  performance: "Performance",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
}

const DIFFICULTY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  easy: "secondary",
  medium: "default",
  hard: "destructive",
}

export const challengeTemplateColumns: ColumnDef<ChallengeTemplate>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {TYPE_LABELS[row.original.type] ?? row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulte",
    cell: ({ row }) => (
      <Badge variant={DIFFICULTY_VARIANT[row.original.difficulty] ?? "default"}>
        {DIFFICULTY_LABELS[row.original.difficulty] ?? row.original.difficulty}
      </Badge>
    ),
  },
  {
    accessorKey: "titleFr",
    header: "Titre FR",
  },
  {
    accessorKey: "targetValue",
    header: "Cible",
  },
  {
    accessorKey: "acesReward",
    header: "Aces",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.acesReward}</span>
    ),
  },
  {
    id: "levelRange",
    header: "Niveaux",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.minLevel}-{row.original.maxLevel ?? "max"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Actif",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Actif" : "Inactif"}
      </Badge>
    ),
  },
]

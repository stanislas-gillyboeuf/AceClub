"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AdminBadge } from "@/types/admin"

const CATEGORY_LABELS: Record<string, string> = {
  level: "Niveau",
  achievement: "Accomplissement",
  milestone: "Jalon",
  special: "Special",
}

export const badgeColumns: ColumnDef<AdminBadge>[] = [
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => (
      <Avatar className="h-8 w-8">
        <AvatarImage src={row.original.imageUrl} alt={row.original.code} />
        <AvatarFallback>{row.original.code.slice(0, 2)}</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Categorie",
    cell: ({ row }) => (
      <Badge variant="outline">
        {CATEGORY_LABELS[row.original.category] ?? row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: "nameFr",
    header: "Nom FR",
  },
  {
    accessorKey: "requiredLevel",
    header: "Niveau requis",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.requiredLevel ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "displayOrder",
    header: "Ordre",
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
  {
    accessorKey: "unlockCount",
    header: "Utilisateurs",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{Number(row.original.unlockCount)}</span>
    ),
  },
]

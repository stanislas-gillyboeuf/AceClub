"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ClubMemberListItem } from "@/types/club-admin"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export const clubMembersColumns: ColumnDef<ClubMemberListItem>[] = [
  {
    accessorKey: "userName",
    header: "Membre",
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.userImage ?? undefined} alt={member.userName} />
            <AvatarFallback className="text-xs">{getInitials(member.userName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{member.userName}</span>
            <span className="text-xs text-muted-foreground">{member.userEmail}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const { role } = row.original
      if (!["owner", "admin"].includes(role)) {
        return <Badge variant="secondary">Membre</Badge>
      }
      return <Badge>{role === "owner" ? "Propriétaire" : "Admin"}</Badge>
    },
  },
  {
    accessorKey: "licenseValidUntil",
    header: "Licence",
    cell: ({ row }) => {
      const { licenseNumber, licenseValidUntil } = row.original
      if (!licenseNumber) return <span className="text-sm text-muted-foreground">—</span>
      const expired = licenseValidUntil ? new Date(licenseValidUntil) < new Date() : false
      return (
        <div className="flex flex-col">
          <span className="text-sm">{licenseNumber}</span>
          {licenseValidUntil ? (
            <Badge variant={expired ? "destructive" : "outline"} className="w-fit text-xs">
              {expired ? "Expirée" : `Valide jusqu'au ${formatDate(licenseValidUntil)}`}
            </Badge>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: "recentBookingCount",
    header: "Réservations (90j)",
    cell: ({ row }) => row.original.recentBookingCount,
  },
  {
    accessorKey: "memberSince",
    header: "Membre depuis",
    cell: ({ row }) => formatDate(row.original.memberSince),
  },
]

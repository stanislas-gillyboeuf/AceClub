"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VerifiedBadge } from "@/components/ui/verified-badge"
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

export function getClubMembersColumns(
  onDelete: (member: ClubMemberListItem) => void,
  deletePendingUserId?: string,
): ColumnDef<ClubMemberListItem>[] {
  return [
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
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{member.userName}</span>
                {member.isVip ? (
                  <Badge variant="outline" className="text-xs">
                    VIP
                  </Badge>
                ) : null}
              </div>
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
        if (role === "coach") return <Badge variant="outline">Coach</Badge>
        if (!["owner", "admin"].includes(role)) {
          return <Badge variant="secondary">Membre</Badge>
        }
        return <Badge>{role === "owner" ? "Propriétaire" : "Admin"}</Badge>
      },
    },
    {
      accessorKey: "skillLevel",
      header: "Niveau",
      cell: ({ row }) => {
        const { skillLevel, skillLevelVerified } = row.original
        if (!skillLevel) return <span className="text-sm text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{skillLevel}</span>
            {skillLevelVerified ? <VerifiedBadge /> : null}
          </div>
        )
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const member = row.original
        if (member.role === "owner") return null
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              disabled={deletePendingUserId === member.userId}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(member)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}

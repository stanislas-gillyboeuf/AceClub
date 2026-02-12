"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Organization } from "@/types/admin";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const organizationsColumns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Organisation",
    cell: ({ row }) => {
      const org = row.original;
      let isHidden = false;
      if (org.metadata) {
        try {
          const meta = typeof org.metadata === "string" ? JSON.parse(org.metadata) : org.metadata;
          isHidden = !!meta.hidden;
        } catch {
          // ignore invalid metadata JSON
        }
      }
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={org.logo ?? undefined} alt={org.name} />
            <AvatarFallback className="text-xs">{getInitials(org.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{org.name}</span>
          {isHidden && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Caché
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span>,
  },
  {
    accessorKey: "memberCount",
    header: "Membres",
    cell: ({ row }) => <Badge variant="secondary">{row.original.memberCount}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Création",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

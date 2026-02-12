"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function impersonateUser(userId: string) {
  // This function should call your backend API to start impersonation
  // For example:
  // fetch(`/api/impersonate/${userId}`, { method: "POST" })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     if (data.success) {
  //       window.location.href = "/"; // Redirect to homepage or dashboard
  //     } else {
  //       alert("Failed to impersonate user");
  //     }
  //   })
  //   .catch(() => alert("An error occurred while impersonating user"));
}

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Utilisateur",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.original.role;
      return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
    },
  },
  {
    accessorKey: "banned",
    header: "Statut",
    cell: ({ row }) => {
      const banned = row.original.banned;
      return (
        <Badge variant={banned ? "destructive" : "outline"}>{banned ? "Banni" : "Actif"}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Inscription",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => impersonateUser(row.original.id)}>
            Impersonate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

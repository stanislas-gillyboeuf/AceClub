"use client";

import { useCallback, useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";
import { MoreHorizontal, Search, ShieldCheck, ShieldBan, RefreshCw } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
}

interface ListUsersResponse {
  users: User[];
  total: number;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchField, setSearchField] = useState<"email" | "name">("name");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<ListUsersResponse>("/admin/list-users", {
        params: {
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          searchValue: searchValue || undefined,
          searchField: searchValue ? searchField : undefined,
          searchOperator: searchValue ? "contains" : undefined,
          sortBy,
          sortDirection,
        },
      });
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchValue, searchField, sortBy, sortDirection]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = async (userId: string) => {
    try {
      await apiFetch("/admin/ban-user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to ban user:", err);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await apiFetch("/admin/unban-user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to unban user:", err);
    }
  };

  const handleSetRole = async (userId: string, role: string) => {
    try {
      await apiFetch("/admin/set-role", {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to set role:", err);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              {row.original.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          )}
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.id.slice(0, 12)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.email}</span>
          {row.original.emailVerified && (
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role || "user";
        return (
          <Badge
            variant={role === "admin" ? "default" : "outline"}
            className={role === "admin" ? "" : "text-muted-foreground"}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Statut",
      cell: ({ row }) => {
        if (row.original.banned) {
          return (
            <Badge variant="destructive" className="gap-1">
              <ShieldBan className="h-3 w-3" />
              Banni
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="border-primary/30 text-primary"
          >
            Actif
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Inscription",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.role !== "admin" ? (
                <DropdownMenuItem onClick={() => handleSetRole(user.id, "admin")}>
                  Promouvoir admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleSetRole(user.id, "user")}>
                  Retirer admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {user.banned ? (
                <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                  Debannir
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleBanUser(user.id)}
                >
                  Bannir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">
          Gestion des utilisateurs de la plateforme.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={searchField}
          onValueChange={(v) => setSearchField(v as "email" | "name")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={`${sortBy}:${sortDirection}`}
          onValueChange={(v) => {
            const [field, dir] = v.split(":");
            setSortBy(field);
            setSortDirection(dir as "asc" | "desc");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Plus recents</SelectItem>
            <SelectItem value="createdAt:asc">Plus anciens</SelectItem>
            <SelectItem value="name:asc">Nom A-Z</SelectItem>
            <SelectItem value="name:desc">Nom Z-A</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        pageCount={pageCount}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

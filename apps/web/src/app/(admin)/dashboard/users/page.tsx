"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/custom/data-table"
import { usersColumns } from "@/components/custom/users-columns"
import { useAdminUsers } from "@/hooks/use-admin-queries"
import type { User, ListUsersParams } from "@/types/admin"

const PAGE_SIZE = 20

export default function UsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageIndex, setPageIndex] = useState(0)

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Reset page on filter change
  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch, roleFilter, statusFilter])

  const params: ListUsersParams = {
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(debouncedSearch && {
      searchValue: debouncedSearch,
      searchField: "name" as const,
    }),
    ...(roleFilter !== "all" && {
      filterField: "role",
      filterValue: roleFilter,
    }),
    ...(statusFilter !== "all" && {
      filterField: "banned",
      filterValue: statusFilter === "banned" ? "true" : "false",
    }),
  }

  const { data, isLoading } = useAdminUsers(params)

  const handleRowClick = useCallback(
    (user: User) => {
      router.push(`/dashboard/users/${user.id}`)
    },
    [router],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérer les utilisateurs de la plateforme
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="banned">Banni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={usersColumns}
        data={data?.users ?? []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPageIndex,
        }}
      />
    </div>
  )
}

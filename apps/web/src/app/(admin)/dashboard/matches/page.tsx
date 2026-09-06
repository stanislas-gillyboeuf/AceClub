"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/custom/data-table"
import { matchesColumns } from "@/components/custom/matches-columns"
import { useAdminMatches } from "@/hooks/use-admin-queries"
import type { AdminMatch } from "@/types/admin"

const PAGE_SIZE = 20

export default function MatchesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    setPageIndex(0)
  }, [statusFilter])

  const { data, isLoading } = useAdminMatches({
    limit: PAGE_SIZE,
    page: pageIndex + 1,
    ...(statusFilter !== "all" && { status: statusFilter }),
  })

  const handleRowClick = useCallback(
    (match: AdminMatch) => {
      router.push(`/dashboard/matches/${match.id}`)
    },
    [router],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight">Matchs</h1>
        <p className="text-muted-foreground">
          Tous les matchs de la plateforme
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="scheduled">Programmé</SelectItem>
            <SelectItem value="ongoing">En cours</SelectItem>
            <SelectItem value="finished">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={matchesColumns}
        data={data?.matches ?? []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          total: data?.pagination?.total ?? 0,
          onPageChange: setPageIndex,
        }}
      />
    </div>
  )
}

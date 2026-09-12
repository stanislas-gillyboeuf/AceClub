"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { DataTable } from "@/components/custom/data-table"
import { clubMembersColumns } from "@/components/custom/club-members-columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClubMembers } from "@/hooks/use-club-member-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { ClubMemberListItem } from "@/types/club-admin"

const PAGE_SIZE = 20

export default function ClubMembersPage() {
  const router = useRouter()
  const { organizationId, access } = useClubAdminContext()
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)

  const { data, isLoading } = useClubMembers({
    organizationId,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Membres</h1>
        {access === "full" ? (
          <Button variant="outline" onClick={() => router.push("/club/members/import")}>
            <Upload className="mr-2 h-4 w-4" />
            Importer un fichier CSV
          </Button>
        ) : null}
      </div>

      <Input
        placeholder="Rechercher un membre par nom, email ou numéro de licence..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPageIndex(0)
        }}
        className="mt-6 max-w-sm"
      />

      <div className="mt-4">
        <DataTable<ClubMemberListItem, unknown>
          columns={clubMembersColumns}
          data={data?.members ?? []}
          isLoading={isLoading}
          onRowClick={(member) => router.push(`/club/members/${member.userId}`)}
          pagination={{
            pageIndex,
            pageSize: PAGE_SIZE,
            total: data?.total ?? 0,
            onPageChange: setPageIndex,
          }}
        />
      </div>
    </div>
  )
}

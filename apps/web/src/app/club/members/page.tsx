"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, UserPlus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/custom/data-table"
import { getClubMembersColumns } from "@/components/custom/club-members-columns"
import { AddMemberDialog } from "@/components/custom/add-member-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClubMembers } from "@/hooks/use-club-member-queries"
import { useRemoveClubMember } from "@/hooks/use-club-member-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { ClubMemberListItem } from "@/types/club-admin"

const PAGE_SIZE = 20

export default function ClubMembersPage() {
  const router = useRouter()
  const { organizationId, access } = useClubAdminContext()
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClubMemberListItem | null>(null)

  const { data, isLoading } = useClubMembers({
    organizationId,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  })
  const removeMember = useRemoveClubMember()

  const columns = getClubMembersColumns(
    setDeleteTarget,
    removeMember.isPending ? removeMember.variables?.userId : undefined,
  )

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Membres</h1>
        {access === "full" ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/club/members/import")}>
              <Upload className="mr-2 h-4 w-4" />
              Importer un fichier CSV
            </Button>
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un membre
            </Button>
          </div>
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
          columns={columns}
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

      <AddMemberDialog
        organizationId={organizationId}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleteTarget?.userName} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Retire son adhésion à ce club (profil, notes internes, abonnement). Son historique
              de réservations reste intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  removeMember.mutate(
                    { organizationId, userId: deleteTarget.userId },
                    { onSuccess: () => setDeleteTarget(null) },
                  )
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

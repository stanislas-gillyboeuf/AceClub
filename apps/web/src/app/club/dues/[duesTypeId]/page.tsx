"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/custom/data-table"
import { getDuesAssignmentColumns } from "@/components/custom/dues-columns"
import { MarkPaidDialog, WaiveDialog } from "@/components/custom/dues-actions"
import { useDuesAssignments, useDuesTypes } from "@/hooks/use-dues-queries"
import { useSendDuesReminder } from "@/hooks/use-dues-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { DuesAssignment, DuesAssignmentStatus } from "@/types/dues"

const PAGE_SIZE = 20

export default function ClubDuesTypeDetailPage() {
  const router = useRouter()
  const params = useParams<{ duesTypeId: string }>()
  const { organizationId } = useClubAdminContext()
  const { data: duesTypes } = useDuesTypes(organizationId)
  const duesType = duesTypes?.find((t) => t.id === params.duesTypeId)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<DuesAssignmentStatus | "all">("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [markPaidTarget, setMarkPaidTarget] = useState<DuesAssignment | null>(null)
  const [waiveTarget, setWaiveTarget] = useState<DuesAssignment | null>(null)

  const { data, isLoading } = useDuesAssignments({
    organizationId,
    duesTypeId: params.duesTypeId,
    status: status === "all" ? undefined : status,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  })

  const sendReminder = useSendDuesReminder()

  const columns = getDuesAssignmentColumns({
    onMarkPaid: setMarkPaidTarget,
    onWaive: setWaiveTarget,
    onRemind: (a) => sendReminder.mutate({ assignmentId: a.id }),
    pendingId: sendReminder.isPending ? sendReminder.variables?.assignmentId : undefined,
  })

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/dues")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux cotisations
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">{duesType?.name ?? "Cotisation"}</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPageIndex(0)
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v: DuesAssignmentStatus | "all") => {
            setStatus(v)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="waived">Exonéré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        <DataTable<DuesAssignment, unknown>
          columns={columns}
          data={data?.assignments ?? []}
          isLoading={isLoading}
          pagination={{
            pageIndex,
            pageSize: PAGE_SIZE,
            total: data?.total ?? 0,
            onPageChange: setPageIndex,
          }}
        />
      </div>

      <MarkPaidDialog
        assignment={markPaidTarget}
        onOpenChange={(open) => {
          if (!open) setMarkPaidTarget(null)
        }}
      />
      <WaiveDialog
        assignment={waiveTarget}
        onOpenChange={(open) => {
          if (!open) setWaiveTarget(null)
        }}
      />
    </div>
  )
}

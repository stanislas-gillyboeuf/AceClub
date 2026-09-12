"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateDuesTypeDialog } from "@/components/custom/dues-actions"
import { useDuesTypes } from "@/hooks/use-dues-queries"
import { useAssignDues } from "@/hooks/use-dues-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

function formatAmount(amountCents: number) {
  return (amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function ClubDuesPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const { data: duesTypes, isLoading } = useDuesTypes(organizationId)
  const assignDues = useAssignDues()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cotisations</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle cotisation
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : !duesTypes?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucune cotisation créée pour le moment.
            </CardContent>
          </Card>
        ) : (
          duesTypes.map((type) => (
            <Card
              key={type.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => router.push(`/club/dues/${type.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{type.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatAmount(type.amountCents)}
                    {type.dueDate ? ` · Échéance le ${formatDate(type.dueDate)}` : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={assignDues.isPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    assignDues.mutate({ organizationId, duesTypeId: type.id, allActiveMembers: true })
                  }}
                >
                  Assigner à tous les membres
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {type.summary.pending} en attente
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {type.summary.paid} payé
                  </Badge>
                  <Badge variant="secondary">{type.summary.waived} exonéré</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateDuesTypeDialog
        organizationId={organizationId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}

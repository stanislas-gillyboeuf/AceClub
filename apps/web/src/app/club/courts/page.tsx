"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CourtFormDialog } from "@/components/custom/court-actions"
import { useClubCourts } from "@/hooks/use-club-court-queries"
import { useUpdateCourt } from "@/hooks/use-club-court-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { Court } from "@/types/court"

const SURFACE_LABELS: Record<string, string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  carpet: "Moquette",
}

export default function ClubCourtsPage() {
  const { organizationId } = useClubAdminContext()
  const { data: courts, isLoading } = useClubCourts(organizationId)
  const updateCourt = useUpdateCourt()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  function openCreate() {
    setEditingCourt(null)
    setDialogOpen(true)
  }

  function openEdit(court: Court) {
    setEditingCourt(court)
    setDialogOpen(true)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Courts</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/club/courts/rules">
              <Settings className="mr-2 h-4 w-4" />
              Règles de réservation
            </Link>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un court
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !courts?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun court pour le moment.
            </CardContent>
          </Card>
        ) : (
          courts.map((court) => (
            <Card key={court.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                <div>
                  <CardTitle className="text-base">{court.name}</CardTitle>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">
                      {court.sport === "tennis" ? "Tennis" : "Padel"}
                    </Badge>
                    {court.surface ? (
                      <Badge variant="outline">{SURFACE_LABELS[court.surface]}</Badge>
                    ) : null}
                    {court.indoor ? <Badge variant="outline">Couvert</Badge> : null}
                    <Badge variant="outline">
                      {court.accessPolicy === "open" ? "Ouvert à tous" : "Membres uniquement"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={court.isActive}
                    disabled={updateCourt.isPending}
                    onCheckedChange={(checked) =>
                      updateCourt.mutate({ courtId: court.id, isActive: checked })
                    }
                  />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(court)}>
                    Modifier
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <CourtFormDialog
        organizationId={organizationId}
        court={editingCourt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

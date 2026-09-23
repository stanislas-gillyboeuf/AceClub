"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TarifGridAdditionalLinesSection } from "./tarif-grid-additional-lines-section"
import { TarifGridAgeCategoriesSection } from "./tarif-grid-age-categories-section"
import { TarifGridAuditLog } from "./tarif-grid-audit-log"
import { TarifGridBaseRatesSection } from "./tarif-grid-base-rates-section"
import { TarifGridCreateDialog } from "./tarif-grid-create-dialog"
import { TarifGridLessonRatesSection } from "./tarif-grid-lesson-rates-section"
import { TarifGridRulesSection } from "./tarif-grid-rules-section"
import { TarifGridSettingsSection } from "./tarif-grid-settings-section"
import { TarifGridSimulatorPanel } from "./tarif-grid-simulator-panel"
import { useClubTags } from "@/hooks/use-club-tag-queries"
import { useActivateTarifGrid } from "@/hooks/use-tarif-grid-mutations"
import { useActiveTarifGrid, useTarifGrid, useTarifGrids } from "@/hooks/use-tarif-grid-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { TarifGridStatus } from "@/types/tarif-grid"

const STATUS_LABELS: Record<TarifGridStatus, string> = {
  draft: "Brouillon",
  active: "Active",
  archived: "Archivée",
}

const STATUS_STYLES: Record<TarifGridStatus, string> = {
  draft: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  archived: "bg-muted text-muted-foreground",
}

export function TarifGridTabContent() {
  const { organizationId } = useClubAdminContext()
  const { data: gridsData, isLoading: gridsLoading } = useTarifGrids(organizationId)
  const { data: tagsData } = useClubTags(organizationId)
  const activateGrid = useActivateTarifGrid()

  const allGrids = gridsData?.grids ?? []
  const tags = tagsData?.tags ?? []

  const seasons = useMemo(() => {
    const set = new Set(allGrids.map((g) => g.seasonLabel))
    return [...set].sort().reverse()
  }, [allGrids])

  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(undefined)
  const [createOpen, setCreateOpen] = useState(false)
  const [activateConfirmOpen, setActivateConfirmOpen] = useState(false)

  const effectiveSeason = selectedSeason ?? seasons[0]

  const { data: activeGridData } = useActiveTarifGrid(organizationId, effectiveSeason)
  const seasonGrids = allGrids.filter((g) => g.seasonLabel === effectiveSeason)
  const newestDraft = [...seasonGrids].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]
  const displayedGridId = activeGridData?.grid?.id ?? newestDraft?.id

  const { data: gridDetail, dataUpdatedAt } = useTarifGrid(displayedGridId)

  if (gridsLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!effectiveSeason || !displayedGridId || !gridDetail) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Grille tarifaire</h1>
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune grille tarifaire configurée pour le moment. Créez-en une pour calculer automatiquement la
              cotisation de chaque adhérent.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une grille
            </Button>
          </CardContent>
        </Card>
        <TarifGridCreateDialog
          organizationId={organizationId}
          open={createOpen}
          onOpenChange={setCreateOpen}
          existingGrids={allGrids}
        />
      </div>
    )
  }

  const { grid, ageCategories, baseRates, lessonRates, additionalLines, rules, warnings } = gridDetail

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Grille tarifaire</h1>
          <Badge className={STATUS_STYLES[grid.status]}>{STATUS_LABELS[grid.status]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={effectiveSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle saison
          </Button>
          {grid.status === "draft" ? (
            <Button onClick={() => setActivateConfirmOpen(true)} disabled={activateGrid.isPending}>
              {activateGrid.isPending ? "Activation..." : "Activer cette grille"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TarifGridSettingsSection grid={grid} />
          <TarifGridAgeCategoriesSection gridId={grid.id} ageCategories={ageCategories} warnings={warnings} />
          <TarifGridBaseRatesSection gridId={grid.id} ageCategories={ageCategories} baseRates={baseRates} />
          <TarifGridLessonRatesSection gridId={grid.id} ageCategories={ageCategories} lessonRates={lessonRates} />
          <TarifGridAdditionalLinesSection
            gridId={grid.id}
            additionalLines={additionalLines}
            ageCategories={ageCategories}
            tags={tags}
          />
          <TarifGridRulesSection
            gridId={grid.id}
            rules={rules}
            ageCategories={ageCategories}
            additionalLines={additionalLines}
            tags={tags}
            warnings={warnings}
          />
          <TarifGridAuditLog gridId={grid.id} />
        </div>

        <div className="lg:col-span-1">
          <TarifGridSimulatorPanel organizationId={organizationId} gridId={grid.id} gridVersion={dataUpdatedAt ?? 0} />
        </div>
      </div>

      <TarifGridCreateDialog
        organizationId={organizationId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingGrids={allGrids}
      />

      <AlertDialog open={activateConfirmOpen} onOpenChange={setActivateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer cette grille ?</AlertDialogTitle>
            <AlertDialogDescription>
              La grille active actuelle pour la saison « {grid.seasonLabel} » (s&apos;il y en a une) sera archivée.
              Cette grille deviendra la référence pour calculer les cotisations des adhérents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                activateGrid.mutate(grid.id)
                setActivateConfirmOpen(false)
              }}
            >
              Activer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

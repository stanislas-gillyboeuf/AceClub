"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateTarifGrid } from "@/hooks/use-tarif-grid-mutations"
import type { TarifGrid } from "@/types/tarif-grid"

type Mode = "blank" | "duplicate" | "template"

const MODE_LABELS: Record<Mode, string> = {
  blank: "Grille vide",
  duplicate: "Dupliquer une saison précédente",
  template: "Modèle « Club associatif type »",
}

function defaultSeasonDates() {
  const year = new Date().getFullYear()
  return {
    start: `${year}-09-01`,
    end: `${year + 1}-08-31`,
  }
}

interface TarifGridCreateDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  existingGrids: TarifGrid[]
  defaultSeasonLabel?: string
}

export function TarifGridCreateDialog({
  organizationId,
  open,
  onOpenChange,
  existingGrids,
  defaultSeasonLabel,
}: TarifGridCreateDialogProps) {
  const createGrid = useCreateTarifGrid()
  const defaults = defaultSeasonDates()

  const [mode, setMode] = useState<Mode>(existingGrids.length > 0 ? "duplicate" : "template")
  const [seasonLabel, setSeasonLabel] = useState(defaultSeasonLabel ?? "")
  const [seasonStartDate, setSeasonStartDate] = useState(defaults.start)
  const [seasonEndDate, setSeasonEndDate] = useState(defaults.end)
  const [duplicateFromGridId, setDuplicateFromGridId] = useState(existingGrids[0]?.id ?? "")

  const isValid =
    seasonLabel.trim().length > 0 &&
    seasonStartDate.length > 0 &&
    seasonEndDate.length > 0 &&
    (mode !== "duplicate" || !!duplicateFromGridId)

  function submit() {
    createGrid.mutate(
      {
        organizationId,
        seasonLabel: seasonLabel.trim(),
        seasonStartDate: new Date(seasonStartDate).toISOString(),
        seasonEndDate: new Date(seasonEndDate).toISOString(),
        mode,
        duplicateFromGridId: mode === "duplicate" ? duplicateFromGridId : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle grille tarifaire</DialogTitle>
          <DialogDescription>
            Configurée une fois, elle calcule automatiquement la cotisation de chaque adhérent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Point de départ</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">{MODE_LABELS.blank}</SelectItem>
                <SelectItem value="template">{MODE_LABELS.template}</SelectItem>
                {existingGrids.length > 0 ? (
                  <SelectItem value="duplicate">{MODE_LABELS.duplicate}</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          {mode === "duplicate" ? (
            <div className="space-y-1.5">
              <Label>Grille source</Label>
              <Select value={duplicateFromGridId} onValueChange={setDuplicateFromGridId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {existingGrids.map((grid) => (
                    <SelectItem key={grid.id} value={grid.id}>
                      {grid.seasonLabel} (v{grid.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="new-season-label">Saison</Label>
            <Input
              id="new-season-label"
              placeholder="Ex : 2026-2027"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-season-start">Début</Label>
              <Input
                id="new-season-start"
                type="date"
                value={seasonStartDate}
                onChange={(e) => setSeasonStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-season-end">Fin</Label>
              <Input
                id="new-season-end"
                type="date"
                value={seasonEndDate}
                onChange={(e) => setSeasonEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={!isValid || createGrid.isPending}>
            {createGrid.isPending ? "Création..." : "Créer la grille"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

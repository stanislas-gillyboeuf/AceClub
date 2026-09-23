"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateGridSettings } from "@/hooks/use-tarif-grid-mutations"
import type { TarifAgeReferenceMode, TarifCumulMode, TarifGrid, TarifRoundingIncrement } from "@/types/tarif-grid"

const AGE_REFERENCE_LABELS: Record<TarifAgeReferenceMode, string> = {
  season_start: "Au 1er septembre de la saison",
  dec_31_start_year: "Au 31 décembre de l'année de début",
  season_end_year: "Âge atteint dans l'année de fin de saison",
}

const CUMUL_LABELS: Record<TarifCumulMode, string> = {
  cumulative: "Cumuler les réductions",
  best_only: "Appliquer uniquement la plus avantageuse",
}

const ROUNDING_LABELS: Record<TarifRoundingIncrement, string> = {
  none: "Aucun",
  fifty_cents: "0,50 € (à l'inférieur)",
  one_euro: "1 € (à l'inférieur)",
}

interface TarifGridSettingsSectionProps {
  grid: TarifGrid
}

export function TarifGridSettingsSection({ grid }: TarifGridSettingsSectionProps) {
  const updateSettings = useUpdateGridSettings()
  const [capInput, setCapInput] = useState(grid.reductionCapPercent?.toString() ?? "")

  function commitCap() {
    const value = capInput.trim() === "" ? null : Number(capInput)
    if (value !== grid.reductionCapPercent) {
      updateSettings.mutate({ gridId: grid.id, reductionCapPercent: value })
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Paramètres</h2>
        <p className="text-sm text-muted-foreground">Ces réglages s'appliquent à toute la grille.</p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="season-start">Début de saison</Label>
          <Input
            id="season-start"
            type="date"
            defaultValue={grid.seasonStartDate.slice(0, 10)}
            onBlur={(e) =>
              updateSettings.mutate({ gridId: grid.id, seasonStartDate: new Date(e.target.value).toISOString() })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="season-end">Fin de saison</Label>
          <Input
            id="season-end"
            type="date"
            defaultValue={grid.seasonEndDate.slice(0, 10)}
            onBlur={(e) =>
              updateSettings.mutate({ gridId: grid.id, seasonEndDate: new Date(e.target.value).toISOString() })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date de référence de l'âge</Label>
          <Select
            value={grid.ageReferenceMode}
            onValueChange={(v) => updateSettings.mutate({ gridId: grid.id, ageReferenceMode: v as TarifAgeReferenceMode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AGE_REFERENCE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Mode de cumul</Label>
          <Select
            value={grid.cumulMode}
            onValueChange={(v) => updateSettings.mutate({ gridId: grid.id, cumulMode: v as TarifCumulMode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CUMUL_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reduction-cap">Plafond de réduction (optionnel, %)</Label>
          <Input
            id="reduction-cap"
            type="number"
            min={0}
            max={100}
            placeholder="Aucun plafond"
            value={capInput}
            onChange={(e) => setCapInput(e.target.value)}
            onBlur={commitCap}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Arrondi (toujours à l'inférieur)</Label>
          <Select
            value={grid.roundingIncrement}
            onValueChange={(v) => updateSettings.mutate({ gridId: grid.id, roundingIncrement: v as TarifRoundingIncrement })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROUNDING_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

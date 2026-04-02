"use client"

import { useState } from "react"
import { RotateCcw, Save, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGameConfig } from "@/hooks/use-admin-queries"
import { useUpdateGameConfig, useResetGameConfig } from "@/hooks/use-admin-mutations"
import type { GameConfigEntry } from "@/types/admin"

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  aces_rewards: {
    title: "Recompenses Aces",
    description: "Points attribues pour les matchs et defis",
  },
  level_formula: {
    title: "Formule de Niveau",
    description: "Parametres de la progression de niveau",
  },
  streak_multiplier: {
    title: "Multiplicateurs de Serie",
    description: "Bonus de points bases sur la serie de semaines actives",
  },
}

const KEY_LABELS: Record<string, string> = {
  MATCH_PARTICIPATION: "Participation match",
  MATCH_VICTORY: "Victoire match",
  CHALLENGE_BASE: "Defi (base)",
  BASE_ACES: "Aces de base",
  GROWTH_RATE: "Taux de croissance",
  MAX_LEVEL: "Niveau maximum",
  week_1: "Semaine 1",
  week_2: "Semaine 2",
  week_3_4: "Semaines 3-4",
  week_5_7: "Semaines 5-7",
  week_8_11: "Semaines 8-11",
  week_12_plus: "Semaine 12+",
}

function LevelPreview({ config }: { config: GameConfigEntry[] }) {
  const baseAces = parseFloat(config.find((c) => c.key === "BASE_ACES")?.value ?? "100")
  const growthRate = parseFloat(config.find((c) => c.key === "GROWTH_RATE")?.value ?? "1.15")

  const previewLevels = [5, 10, 25, 50, 100]

  function getTotalAcesForLevel(level: number): number {
    let total = 0
    for (let i = 2; i <= level; i++) {
      total += Math.floor(baseAces * Math.pow(growthRate, i - 2))
    }
    return total
  }

  return (
    <div className="mt-4 rounded-md border p-3">
      <p className="text-sm font-medium mb-2">Apercu des niveaux</p>
      <div className="grid grid-cols-5 gap-2 text-sm">
        {previewLevels.map((lvl) => (
          <div key={lvl} className="text-center">
            <div className="font-mono font-medium">Niv. {lvl}</div>
            <div className="text-muted-foreground">
              {getTotalAcesForLevel(lvl).toLocaleString()} aces
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigRow({
  entry,
  onSave,
  isPending,
}: {
  entry: GameConfigEntry
  onSave: (id: string, value: string) => void
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(entry.value)

  const handleSave = () => {
    onSave(entry.id, value)
    setEditing(false)
  }

  const handleCancel = () => {
    setValue(entry.value)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1">
        <span className="text-sm font-medium">{KEY_LABELS[entry.key] ?? entry.key}</span>
        {entry.description && (
          <span className="text-xs text-muted-foreground ml-2">({entry.description})</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-24 h-8 text-right"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") handleCancel()
              }}
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave} disabled={isPending}>
              <Save className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <span className="font-mono text-sm w-24 text-right inline-block">{entry.value}</span>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function GameConfigPage() {
  const { data, isLoading } = useGameConfig()
  const updateMutation = useUpdateGameConfig()
  const resetMutation = useResetGameConfig()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const handleSave = (id: string, value: string) => {
    updateMutation.mutate({ id, value })
  }

  const handleReset = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => setResetDialogOpen(false),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  const config = data?.config ?? {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuration du jeu</h1>
          <p className="text-muted-foreground">
            Parametres de points, niveaux et multiplicateurs
          </p>
        </div>
        <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reinitialiser
        </Button>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([category, { title, description }]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {(config[category] ?? []).map((entry) => (
              <ConfigRow
                key={entry.id}
                entry={entry}
                onSave={handleSave}
                isPending={updateMutation.isPending}
              />
            ))}
            {category === "level_formula" && config[category] && (
              <LevelPreview config={config[category]} />
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reinitialiser la configuration</DialogTitle>
            <DialogDescription>
              Toutes les valeurs seront remises aux valeurs par defaut. Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Reinitialisation..." : "Reinitialiser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

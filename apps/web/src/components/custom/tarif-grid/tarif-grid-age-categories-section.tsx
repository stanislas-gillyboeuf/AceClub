"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpsertAgeCategories } from "@/hooks/use-tarif-grid-mutations"
import type { AgeCategoryItemInput, TarifAgeCategory, TarifGridWarning } from "@/types/tarif-grid"
import { TarifGridWarnings } from "./tarif-grid-warnings"

interface DraftCategory extends AgeCategoryItemInput {
  key: string
}

function toDraft(category: TarifAgeCategory): DraftCategory {
  return { key: category.id, id: category.id, name: category.name, minAge: category.minAge, maxAge: category.maxAge, sortOrder: category.sortOrder }
}

interface TarifGridAgeCategoriesSectionProps {
  gridId: string
  ageCategories: TarifAgeCategory[]
  warnings: TarifGridWarning[]
}

export function TarifGridAgeCategoriesSection({ gridId, ageCategories, warnings }: TarifGridAgeCategoriesSectionProps) {
  const upsert = useUpsertAgeCategories()
  const [items, setItems] = useState<DraftCategory[]>(() => [...ageCategories].sort((a, b) => a.sortOrder - b.sortOrder).map(toDraft))

  useEffect(() => {
    setItems([...ageCategories].sort((a, b) => a.sortOrder - b.sortOrder).map(toDraft))
    // Only re-sync from the server when the grid identity or its category count changes —
    // otherwise every keystroke re-sorts and clobbers in-progress local edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridId, ageCategories.length])

  function update(key: string, patch: Partial<DraftCategory>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, name: "", minAge: 0, maxAge: null, sortOrder: prev.length },
    ])
  }

  function removeRow(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  function save() {
    upsert.mutate({
      gridId,
      items: items.map((item, index) => ({
        id: item.id,
        name: item.name,
        minAge: item.minAge,
        maxAge: item.maxAge,
        sortOrder: index,
      })),
    })
  }

  const summary = [...items]
    .sort((a, b) => a.minAge - b.minAge)
    .map((c) => `${c.name || "?"} (${c.minAge}-${c.maxAge ?? "∞"})`)
    .join(" · ")

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Catégories d&apos;âge</h2>
        <p className="text-sm text-muted-foreground">{summary || "Aucune catégorie configurée."}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <TarifGridWarnings warnings={warnings.filter((w) => w.code.startsWith("age_category_"))} />

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Nom</Label>
                <Input
                  placeholder="Ex : Jeune"
                  value={item.name}
                  onChange={(e) => update(item.key, { name: e.target.value })}
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs text-muted-foreground">Âge min</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.minAge}
                  onChange={(e) => update(item.key, { minAge: Number(e.target.value) })}
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs text-muted-foreground">Âge max</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Illimité"
                  value={item.maxAge ?? ""}
                  onChange={(e) => update(item.key, { maxAge: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRow(item.key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter une catégorie
          </Button>
          <Button size="sm" onClick={save} disabled={upsert.isPending || items.length === 0}>
            {upsert.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

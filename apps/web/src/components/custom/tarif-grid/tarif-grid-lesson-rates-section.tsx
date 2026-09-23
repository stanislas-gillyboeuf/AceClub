"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUpsertLessonRates } from "@/hooks/use-tarif-grid-mutations"
import type { TarifAgeCategory, TarifLessonRate } from "@/types/tarif-grid"

const LESSON_COUNTS = [0, 1, 2, 3, 4] as const
const LESSON_LABELS: Record<number, string> = { 0: "0", 1: "1", 2: "2", 3: "3", 4: "4 ou plus" }

function toEuros(cents: number) {
  return (cents / 100).toString()
}

function toCents(euros: string) {
  const value = Number.parseFloat(euros.replace(",", "."))
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 100)) : 0
}

type Grid = Record<string, Record<number, string>>

interface TarifGridLessonRatesSectionProps {
  gridId: string
  ageCategories: TarifAgeCategory[]
  lessonRates: TarifLessonRate[]
}

export function TarifGridLessonRatesSection({ gridId, ageCategories, lessonRates }: TarifGridLessonRatesSectionProps) {
  const upsert = useUpsertLessonRates()
  const [grid, setGrid] = useState<Grid>({})

  useEffect(() => {
    const next: Grid = {}
    for (const category of ageCategories) {
      next[category.id] = {}
      for (const count of LESSON_COUNTS) {
        const rate = lessonRates.find((r) => r.categoryId === category.id && r.lessonsPerWeek === count)
        next[category.id][count] = toEuros(rate?.priceCents ?? 0)
      }
    }
    setGrid(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridId, ageCategories.length, lessonRates.length])

  function update(categoryId: string, count: number, value: string) {
    setGrid((prev) => ({ ...prev, [categoryId]: { ...prev[categoryId], [count]: value } }))
  }

  function save() {
    const items = ageCategories.flatMap((category) =>
      LESSON_COUNTS.map((count) => ({
        categoryId: category.id,
        lessonsPerWeek: count,
        priceCents: toCents(grid[category.id]?.[count] ?? "0"),
      })),
    )
    upsert.mutate({ gridId, items })
  }

  if (ageCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Enseignement / cours</h2>
          <p className="text-sm text-muted-foreground">Ajoutez d&apos;abord une catégorie d&apos;âge.</p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Enseignement / cours</h2>
        <p className="text-sm text-muted-foreground">
          Prix par catégorie et nombre de cours par semaine, en euros — la dégressivité se saisit directement ici.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              {LESSON_COUNTS.map((count) => (
                <TableHead key={count}>{LESSON_LABELS[count]} cours</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ageCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                {LESSON_COUNTS.map((count) => (
                  <TableCell key={count}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-24"
                      value={grid[category.id]?.[count] ?? ""}
                      onChange={(e) => update(category.id, count, e.target.value)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={upsert.isPending}>
            {upsert.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUpsertBaseRates } from "@/hooks/use-tarif-grid-mutations"
import type { TarifAgeCategory, TarifBaseRate } from "@/types/tarif-grid"

interface RowState {
  membership: string
  license: string
}

function toEuros(cents: number) {
  return (cents / 100).toString()
}

function toCents(euros: string) {
  const value = Number.parseFloat(euros.replace(",", "."))
  return Number.isFinite(value) ? Math.max(0, Math.round(value * 100)) : 0
}

interface TarifGridBaseRatesSectionProps {
  gridId: string
  ageCategories: TarifAgeCategory[]
  baseRates: TarifBaseRate[]
}

export function TarifGridBaseRatesSection({ gridId, ageCategories, baseRates }: TarifGridBaseRatesSectionProps) {
  const upsert = useUpsertBaseRates()
  const [rows, setRows] = useState<Record<string, RowState>>({})

  useEffect(() => {
    const next: Record<string, RowState> = {}
    for (const category of ageCategories) {
      const rate = baseRates.find((r) => r.categoryId === category.id)
      next[category.id] = { membership: toEuros(rate?.membershipFeeCents ?? 0), license: toEuros(rate?.licenseFeeCents ?? 0) }
    }
    setRows(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridId, ageCategories.length, baseRates.length])

  function update(categoryId: string, field: keyof RowState, value: string) {
    setRows((prev) => ({ ...prev, [categoryId]: { ...prev[categoryId], [field]: value } }))
  }

  function save() {
    upsert.mutate({
      gridId,
      items: ageCategories.map((category) => ({
        categoryId: category.id,
        membershipFeeCents: toCents(rows[category.id]?.membership ?? "0"),
        licenseFeeCents: toCents(rows[category.id]?.license ?? "0"),
      })),
    })
  }

  if (ageCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Tarifs de base</h2>
          <p className="text-sm text-muted-foreground">Ajoutez d&apos;abord une catégorie d&apos;âge.</p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Tarifs de base</h2>
        <p className="text-sm text-muted-foreground">Adhésion et licence FFT par catégorie d&apos;âge, en euros.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              <TableHead>Adhésion (€)</TableHead>
              <TableHead>Licence FFT (€)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ageCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-28"
                    value={rows[category.id]?.membership ?? ""}
                    onChange={(e) => update(category.id, "membership", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-28"
                    value={rows[category.id]?.license ?? ""}
                    onChange={(e) => update(category.id, "license", e.target.value)}
                  />
                </TableCell>
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

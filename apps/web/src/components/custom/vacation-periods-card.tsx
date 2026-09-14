"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useVacationPeriods } from "@/hooks/use-vacation-period-queries"
import { useCreateVacationPeriod, useDeleteVacationPeriod } from "@/hooks/use-vacation-period-mutations"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function VacationPeriodsCard({ organizationId }: { organizationId: string }) {
  const { data } = useVacationPeriods(organizationId)
  const createPeriod = useCreateVacationPeriod()
  const deletePeriod = useDeleteVacationPeriod()

  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const isValid = name.trim().length > 0 && !!startDate && !!endDate && endDate >= startDate

  function handleAdd() {
    if (!isValid) return
    createPeriod.mutate(
      { organizationId, name: name.trim(), startDate, endDate },
      {
        onSuccess: () => {
          setName("")
          setStartDate("")
          setEndDate("")
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Périodes de vacances</CardTitle>
        <CardDescription>
          Les cours ne génèrent aucune séance sur ces dates, jusqu&apos;à leur date de fin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.vacationPeriods.length ? (
          <ul className="space-y-2">
            {data.vacationPeriods.map((period) => (
              <li key={period.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{period.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(period.startDate)} – {formatDate(period.endDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletePeriod.isPending}
                  onClick={() => deletePeriod.mutate(period.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune période de vacances définie.</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="vacation-name">Nom</Label>
            <Input
              id="vacation-name"
              placeholder="Vacances de printemps"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vacation-start">Début</Label>
            <Input
              id="vacation-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vacation-end">Fin</Label>
            <Input id="vacation-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleAdd} disabled={!isValid || createPeriod.isPending}>
            {createPeriod.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

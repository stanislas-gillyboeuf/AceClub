"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingGrid } from "@/components/custom/booking-grid/booking-grid"
import { SportToggle } from "@/components/custom/booking-grid/sport-toggle"
import { DaySelector } from "@/components/custom/booking-grid/day-selector"
import { BookingCellDialog } from "@/components/custom/booking-grid/booking-cell-dialog"
import { useAdminBoard } from "@/hooks/use-club-court-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { AdminBoardCourt, AdminBoardHourCell, CourtSport } from "@/types/court"

const SURFACE_LABELS: Record<string, string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  carpet: "Moquette",
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ClubBookingsPage() {
  const { organizationId } = useClubAdminContext()
  const [sport, setSport] = useState<CourtSport>("tennis")
  const [date, setDate] = useState(todayKey)
  const [surfaceFilter, setSurfaceFilter] = useState("all")
  const [selection, setSelection] = useState<{
    court: AdminBoardCourt
    cell: AdminBoardHourCell
  } | null>(null)

  const { data: board, isLoading } = useAdminBoard(organizationId, sport, date)

  const surfaces = useMemo(
    () => Array.from(new Set((board?.courts ?? []).map((c) => c.surface).filter(Boolean))),
    [board],
  )

  const filteredCourts = useMemo(
    () =>
      (board?.courts ?? []).filter(
        (c) => surfaceFilter === "all" || c.surface === surfaceFilter,
      ),
    [board, surfaceFilter],
  )

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
        <Button variant="outline" asChild>
          <Link href="/club/courts">
            <Settings className="mr-2 h-4 w-4" />
            Gérer les courts
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <SportToggle sport={sport} onChange={setSport} />
        <DaySelector date={date} onChange={setDate} />
        {surfaces.length > 1 ? (
          <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {surfaces.map((s) => (
                <SelectItem key={s} value={s as string}>
                  {SURFACE_LABELS[s as string] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D4FF3D]" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-black/10 bg-white" /> Réservé
        </span>
      </div>

      <div className="mt-4 rounded-2xl border bg-card p-4 shadow-sm">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <BookingGrid
            courts={filteredCourts}
            onCellClick={(court, cell) => setSelection({ court, cell })}
          />
        )}
      </div>

      <BookingCellDialog
        organizationId={organizationId}
        date={date}
        court={selection?.court ?? null}
        cell={selection?.cell ?? null}
        onOpenChange={(open) => {
          if (!open) setSelection(null)
        }}
      />
    </div>
  )
}

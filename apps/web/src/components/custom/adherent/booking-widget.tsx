"use client"

import { useMemo, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdherentCancelBooking, useAdherentCreateBooking } from "@/hooks/use-adherent-mutations"
import {
  useAdherentBoard,
  useAdherentCourtSettings,
  useAdherentMyBookings,
  useAdherentSearchMembers,
} from "@/hooks/use-adherent-queries"
import { buildCancellationText } from "@/lib/cancellation-policy"
import { buildCourtTypeFilters, courtTag } from "@/lib/court-filters"
import { formatChipWeekday, formatFullDay, nextDays, toDateKey } from "@/lib/court-date"
import { cn } from "@/lib/utils"
import type { BoardCourt, BoardHourCell, BookingParticipantInput, CourtSport } from "@/types/adherent"

const PADEL_TEAM_SIZE = 3
const PADEL_TEAM_COMPLETION_WINDOW_HOURS = 4

function formatBookingDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface PlayerSlot {
  label: string
  userId?: string
  guestName?: string
  name: string | null
}

interface MemberPickerProps {
  organizationId: string
  excludeUserIds: string[]
  onSelect: (selection: { userId?: string; guestName?: string; name: string }) => void
}

function MemberPicker({ organizationId, excludeUserIds, onSelect }: MemberPickerProps) {
  const [query, setQuery] = useState("")
  const { data: results } = useAdherentSearchMembers(organizationId, query)
  const filtered = (results ?? []).filter((m) => !excludeUserIds.includes(m.userId))

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nom du partenaire…"
        className="h-11 rounded-xl border-adh-border bg-adh-bg px-3 text-adh-fg placeholder:text-adh-fg-faint focus-visible:ring-adh-accent-dim"
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim().length > 0) {
            e.preventDefault()
            onSelect({ guestName: query.trim(), name: query.trim() })
            setQuery("")
          }
        }}
      />
      {query.length >= 2 && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-adh-border bg-adh-card shadow-lg">
          {filtered.map((m) => (
            <button
              key={m.userId}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-adh-fg hover:bg-adh-bg"
              onClick={() => {
                onSelect({ userId: m.userId, name: m.name })
                setQuery("")
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface BookingConfirmDialogProps {
  organizationId: string
  sport: CourtSport
  court: BoardCourt
  date: string
  dateLabel: string
  hour: number
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function BookingConfirmDialog({
  organizationId,
  sport,
  court,
  date,
  dateLabel,
  hour,
  onOpenChange,
  onSuccess,
}: BookingConfirmDialogProps) {
  const isPadel = sport === "padel"
  const [slots, setSlots] = useState<PlayerSlot[]>(() =>
    isPadel
      ? [
          { label: "Joueur 2", name: null },
          { label: "Joueur 3", name: null },
          { label: "Joueur 4", name: null },
        ]
      : [{ label: "Partenaire", name: null }],
  )
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conflict, setConflict] = useState(false)
  const createBooking = useAdherentCreateBooking()

  const filledCount = slots.filter((s) => s.name).length
  const canConfirm = isPadel || filledCount === 1
  const cancellationText = buildCancellationText(court.cancellationPolicy, court.cancellationWindowHours)
  const excludeUserIds = slots.map((s) => s.userId).filter((id): id is string => !!id)
  const deadlineHour = Math.max(hour - PADEL_TEAM_COMPLETION_WINDOW_HOURS, 0)

  const handleSelect = (index: number, selection: { userId?: string; guestName?: string; name: string }) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...selection } : s)))
    setExpandedIndex(null)
  }

  const handleRemove = (index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, userId: undefined, guestName: undefined, name: null } : s)))
  }

  const handleConfirm = () => {
    setErrorMessage(null)
    setConflict(false)
    const participants: BookingParticipantInput[] = slots
      .filter((s) => s.name)
      .map((s) => (s.userId ? { userId: s.userId } : { guestName: s.guestName ?? s.name ?? undefined }))

    createBooking.mutate(
      { courtId: court.id, date, startTime: `${String(hour).padStart(2, "0")}:00`, participants },
      {
        onSuccess: () => onSuccess(),
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Impossible de créer la réservation."
          if (/409|déjà réservé|already booked/i.test(message)) {
            setConflict(true)
          } else {
            setErrorMessage(message)
          }
        },
      },
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-adh-border bg-adh-card text-adh-fg">
        <DialogHeader>
          <p className="text-xs font-bold uppercase tracking-wide text-adh-accent-dim">
            Réserver · {isPadel ? "Padel" : "Tennis"}
          </p>
          <DialogTitle className="font-extrabold text-adh-fg">{hour}h–{hour + 1}h</DialogTitle>
          <p className="text-sm text-adh-fg-dim">
            {court.name} · {courtTag(court)} · {dateLabel}
          </p>
        </DialogHeader>

        {errorMessage && (
          <p className="rounded-xl border border-adh-danger/30 bg-adh-danger/10 px-3 py-2 text-sm text-adh-danger">
            {errorMessage}
          </p>
        )}

        {conflict && (
          <div className="space-y-2 rounded-xl border border-adh-danger/30 bg-adh-danger/10 px-3 py-2">
            <p className="text-sm font-semibold text-adh-danger">
              Ce créneau vient d&apos;être réservé par un autre joueur entre-temps.
            </p>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-full border border-adh-border bg-adh-card px-4 text-sm font-bold text-adh-fg hover:bg-adh-bg"
            >
              Choisir un autre créneau
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-adh-fg-dim">
              {isPadel ? `Avec qui (${PADEL_TEAM_SIZE + 1} joueurs au total)` : "Avec qui"}
            </p>
            {isPadel && <span className="text-xs text-adh-fg-faint">optionnel</span>}
          </div>

          {slots.map((slot, index) => (
            <div key={slot.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="h-11 flex-1 justify-start rounded-xl border border-adh-border bg-adh-bg px-4 text-sm font-semibold text-adh-fg hover:bg-adh-border/50"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  {slot.name ?? slot.label}
                </Button>
                {slot.name && (
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-transparent px-3 text-sm font-semibold text-adh-fg-dim hover:bg-adh-bg"
                    onClick={() => handleRemove(index)}
                  >
                    Retirer
                  </Button>
                )}
              </div>
              {expandedIndex === index && (
                <MemberPicker
                  organizationId={organizationId}
                  excludeUserIds={excludeUserIds}
                  onSelect={(selection) => handleSelect(index, selection)}
                />
              )}
            </div>
          ))}
        </div>

        {isPadel && (
          <p className="rounded-xl border border-orange-400/40 bg-orange-400/10 px-3 py-2 text-xs text-adh-fg-dim">
            Vous pouvez compléter l&apos;équipe plus tard. Si elle n&apos;est pas complète{" "}
            <span className="font-bold text-orange-600">avant {deadlineHour}h</span>, le court est automatiquement
            libéré.
          </p>
        )}

        <p className="text-xs text-adh-fg-dim">{cancellationText}</p>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full border border-adh-border bg-transparent px-5 text-sm font-bold text-adh-fg hover:bg-adh-bg"
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={!canConfirm || createBooking.isPending}
            onClick={handleConfirm}
            className="h-11 rounded-full bg-adh-accent px-5 text-sm font-bold text-adh-accent-foreground hover:bg-adh-accent/90"
          >
            {createBooking.isPending ? "…" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MyBookingsListProps {
  organizationId: string
  courtsById: Map<string, BoardCourt>
}

function MyBookingsList({ organizationId, courtsById }: MyBookingsListProps) {
  const { data: bookings, isLoading } = useAdherentMyBookings(organizationId)
  const cancelBooking = useAdherentCancelBooking()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-2xl bg-adh-border/60" />
  }

  if (!bookings || bookings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-adh-fg-dim">Mes réservations à venir</h3>
      <div className="space-y-2">
        {bookings.map((booking) => {
          const court = courtsById.get(booking.courtId)
          return (
            <Card key={booking.id} className="rounded-2xl border-adh-border bg-adh-card shadow-none">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-adh-fg">
                    {booking.courtName}
                    <span className="rounded-full bg-adh-bg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-adh-fg-dim">
                      {booking.sport === "padel" ? "Padel" : "Tennis"}
                    </span>
                  </p>
                  <p className="text-sm text-adh-fg-dim">{formatBookingDate(booking.startAt)}</p>
                </div>
                <Button
                  onClick={() => setCancelTargetId(booking.id)}
                  className="h-9 rounded-full border border-adh-danger/30 bg-transparent px-4 text-sm font-bold text-adh-danger hover:bg-adh-danger/10"
                >
                  Annuler
                </Button>
              </CardContent>
              <AlertDialog open={cancelTargetId === booking.id} onOpenChange={(open) => !open && setCancelTargetId(null)}>
                <AlertDialogContent className="rounded-3xl border-adh-border bg-adh-card text-adh-fg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-adh-fg">Annuler la réservation ?</AlertDialogTitle>
                    <AlertDialogDescription className="text-adh-fg-dim">
                      {booking.courtName}, {formatBookingDate(booking.startAt)}.{" "}
                      {court && buildCancellationText(court.cancellationPolicy, court.cancellationWindowHours)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full border-adh-border bg-transparent text-adh-fg hover:bg-adh-bg">
                      Non
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        cancelBooking.mutate(booking.id)
                        setCancelTargetId(null)
                      }}
                      className="rounded-full bg-adh-danger font-bold text-white hover:bg-adh-danger/90"
                    >
                      Oui, annuler
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

interface BoardCellProps {
  cell: BoardHourCell
  onSelect: () => void
}

function BoardCell({ cell, onSelect }: BoardCellProps) {
  if (cell.status === "free") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="h-11 w-11 shrink-0 rounded-lg bg-adh-accent text-xs font-bold text-adh-accent-foreground transition-transform active:scale-95"
      >
        {cell.hour}h
      </button>
    )
  }
  if (cell.status === "mine") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="h-11 w-11 shrink-0 rounded-lg border-2 border-adh-accent bg-adh-bg text-[10px] font-extrabold text-adh-accent-dim"
      >
        VOUS
      </button>
    )
  }
  if (cell.status === "booked") {
    const accentClass = cell.bookedAsClub ? "border-orange-500 text-orange-600" : "border-red-500 text-red-500"
    return (
      <div
        title={cell.bookedByLabel}
        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-adh-bg text-lg", accentClass)}
      >
        ●
      </div>
    )
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-adh-border text-xs font-semibold text-adh-fg-faint">
      {cell.hour}h
    </div>
  )
}

interface BookingBoardGridProps {
  courts: BoardCourt[]
  onSelectFree: (court: BoardCourt, hour: number) => void
}

function BookingBoardGrid({ courts, onSelectFree }: BookingBoardGridProps) {
  const hours = courts[0]?.hours.map((h) => h.hour) ?? []

  return (
    <div className="overflow-x-auto rounded-2xl border border-adh-border">
      <div className="inline-flex min-w-full">
        <div className="sticky left-0 z-10 flex-none border-r border-adh-border bg-adh-card">
          <div className="flex h-9 items-end justify-start border-b border-adh-border px-3 pb-2">
            <span className="text-[9px] font-bold uppercase tracking-wide text-adh-fg-faint">Court</span>
          </div>
          {courts.map((court) => (
            <div key={court.id} className="flex h-[54px] w-[110px] flex-col justify-center border-b border-adh-border px-3">
              <p className="truncate text-sm font-bold text-adh-fg">{court.name}</p>
              <p className="truncate text-[9px] uppercase text-adh-fg-faint">{courtTag(court)}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex h-9 border-b border-adh-border bg-adh-card">
            {hours.map((h) => (
              <div key={h} className="flex h-9 w-[50px] shrink-0 items-center justify-center">
                <span className="text-xs font-semibold text-adh-fg-dim">{h}h</span>
              </div>
            ))}
          </div>
          {courts.map((court) => (
            <div key={court.id} className="flex h-[54px] items-center gap-1 border-b border-adh-border bg-adh-card px-1">
              {court.hours.map((cell) => (
                <div key={cell.hour} className="flex w-[50px] shrink-0 justify-center">
                  <BoardCell cell={cell} onSelect={() => onSelectFree(court, cell.hour)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface BookingWidgetProps {
  organizationId: string
}

export function BookingWidget({ organizationId }: BookingWidgetProps) {
  const [sport, setSport] = useState<CourtSport>("tennis")
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [courtTypeKey, setCourtTypeKey] = useState("any")
  const [pendingCell, setPendingCell] = useState<{ court: BoardCourt; hour: number } | null>(null)

  const { data: settings } = useAdherentCourtSettings(organizationId)
  const daysAhead = settings?.bookingWindowDays ?? 6
  const days = useMemo(() => nextDays(daysAhead + 1), [daysAhead])

  const dateKey = toDateKey(selectedDate)
  const dayIndex = Math.round((selectedDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  const dateLabel = formatFullDay(selectedDate, dayIndex)

  const { data: board, isLoading: isBoardLoading } = useAdherentBoard(organizationId, sport, dateKey)

  const filters = useMemo(() => buildCourtTypeFilters(sport, board?.courts ?? []), [sport, board])
  const activeFilter = filters.find((f) => f.key === courtTypeKey) ?? filters[0]
  const filteredCourts = useMemo(
    () => (board?.courts ?? []).filter((c) => activeFilter.matches(c)),
    [board, activeFilter],
  )
  const courtsById = useMemo(() => new Map((board?.courts ?? []).map((c) => [c.id, c])), [board])

  const handleSelectSport = (next: CourtSport) => {
    setSport(next)
    setCourtTypeKey("any")
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-adh-fg-dim">Réservation de courts</h2>

      <div className="flex rounded-xl border border-adh-border bg-adh-card p-1">
        {(["tennis", "padel"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSelectSport(s)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors",
              sport === s ? "bg-adh-accent text-adh-accent-foreground" : "text-adh-fg-dim",
            )}
          >
            {s === "tennis" ? "Tennis" : "Padel"}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-adh-fg-dim">Court</p>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setCourtTypeKey(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-semibold",
                f.key === activeFilter.key
                  ? "border-adh-accent bg-adh-accent text-adh-accent-foreground"
                  : "border-adh-border bg-adh-card text-adh-fg-dim",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-adh-fg-dim">
          Jour <span className="normal-case text-adh-fg-faint">— réservable jusqu&apos;à J+{daysAhead}</span>
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((date, index) => {
            const active = toDateKey(date) === dateKey
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex w-12 shrink-0 flex-col items-center rounded-xl border py-2",
                  active ? "border-adh-accent bg-adh-accent" : "border-adh-border bg-adh-card",
                )}
              >
                <span
                  className={cn(
                    "text-[8.5px] font-bold uppercase",
                    active ? "text-adh-accent-foreground" : "text-adh-fg-dim",
                  )}
                >
                  {formatChipWeekday(date, index)}
                </span>
                <span className={cn("mt-0.5 text-base font-bold", active ? "text-adh-accent-foreground" : "text-adh-fg")}>
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-adh-fg-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-adh-accent" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm border border-red-500" /> Réservé
        </span>
      </div>

      {isBoardLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl bg-adh-border/60" />
      ) : filteredCourts.length === 0 ? (
        <p className="py-4 text-center text-sm text-adh-fg-dim">Aucun terrain disponible.</p>
      ) : (
        <BookingBoardGrid courts={filteredCourts} onSelectFree={(court, hour) => setPendingCell({ court, hour })} />
      )}

      {pendingCell && (
        <BookingConfirmDialog
          organizationId={organizationId}
          sport={sport}
          court={pendingCell.court}
          date={dateKey}
          dateLabel={dateLabel}
          hour={pendingCell.hour}
          onOpenChange={(open) => {
            if (!open) setPendingCell(null)
          }}
          onSuccess={() => setPendingCell(null)}
        />
      )}

      <MyBookingsList organizationId={organizationId} courtsById={courtsById} />
    </section>
  )
}

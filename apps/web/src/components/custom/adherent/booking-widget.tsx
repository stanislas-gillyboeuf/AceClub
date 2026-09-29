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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdherentCancelBooking, useAdherentCreateBooking } from "@/hooks/use-adherent-mutations"
import {
  useAdherentAvailability,
  useAdherentCourts,
  useAdherentMyBookings,
  useAdherentSearchMembers,
  useAdherentWeeklyQuota,
} from "@/hooks/use-adherent-queries"
import { buildCancellationText } from "@/lib/cancellation-policy"
import type { AdherentCourt, BookingParticipantInput } from "@/types/adherent"

const PADEL_TEAM_SIZE = 3

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

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
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim().length > 0) {
            e.preventDefault()
            onSelect({ guestName: query.trim(), name: query.trim() })
            setQuery("")
          }
        }}
      />
      {query.length >= 2 && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          {filtered.map((m) => (
            <button
              key={m.userId}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
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
  court: AdherentCourt
  date: string
  startTime: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function BookingConfirmDialog({ organizationId, court, date, startTime, onOpenChange, onSuccess }: BookingConfirmDialogProps) {
  const isPadel = court.sport === "padel"
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
  const createBooking = useAdherentCreateBooking()

  const filledCount = slots.filter((s) => s.name).length
  const canConfirm = isPadel || filledCount === 1
  const cancellationText = buildCancellationText(court.cancellationPolicy, court.cancellationWindowHours)
  const excludeUserIds = slots.map((s) => s.userId).filter((id): id is string => !!id)

  const handleSelect = (index: number, selection: { userId?: string; guestName?: string; name: string }) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...selection } : s)))
    setExpandedIndex(null)
  }

  const handleRemove = (index: number) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, userId: undefined, guestName: undefined, name: null } : s)))
  }

  const handleConfirm = () => {
    setErrorMessage(null)
    const participants: BookingParticipantInput[] = slots
      .filter((s) => s.name)
      .map((s) => (s.userId ? { userId: s.userId } : { guestName: s.guestName ?? s.name ?? undefined }))

    createBooking.mutate(
      { courtId: court.id, date, startTime, participants },
      {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrorMessage(error instanceof Error ? error.message : "Impossible de créer la réservation."),
      },
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {court.name} · {startTime}
          </DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {isPadel ? `Avec qui (${PADEL_TEAM_SIZE + 1} joueurs au total)` : "Avec qui"}
            </p>
            {isPadel && <span className="text-xs text-muted-foreground">optionnel</span>}
          </div>

          {slots.map((slot, index) => (
            <div key={slot.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 justify-start"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  {slot.name ?? slot.label}
                </Button>
                {slot.name && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(index)}>
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

        <p className="text-xs text-muted-foreground">{cancellationText}</p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" disabled={!canConfirm || createBooking.isPending} onClick={handleConfirm}>
            {createBooking.isPending ? "…" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MyBookingsListProps {
  organizationId: string
  courtsById: Map<string, AdherentCourt>
}

function MyBookingsList({ organizationId, courtsById }: MyBookingsListProps) {
  const { data: bookings, isLoading } = useAdherentMyBookings(organizationId)
  const cancelBooking = useAdherentCancelBooking()
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />
  }

  if (!bookings || bookings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-mkt-fg/80">Mes réservations à venir</h3>
      <div className="space-y-2">
        {bookings.map((booking) => {
          const court = courtsById.get(booking.courtId)
          return (
            <Card key={booking.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {booking.courtName} <Badge variant="secondary">{booking.sport === "padel" ? "Padel" : "Tennis"}</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">{formatBookingDate(booking.startAt)}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setCancelTargetId(booking.id)}>
                  Annuler
                </Button>
              </CardContent>
              <AlertDialog open={cancelTargetId === booking.id} onOpenChange={(open) => !open && setCancelTargetId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {booking.courtName}, {formatBookingDate(booking.startAt)}.{" "}
                      {court && buildCancellationText(court.cancellationPolicy, court.cancellationWindowHours)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Non</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        cancelBooking.mutate(booking.id)
                        setCancelTargetId(null)
                      }}
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

interface BookingWidgetProps {
  organizationId: string
}

export function BookingWidget({ organizationId }: BookingWidgetProps) {
  const { data: courts, isLoading: isCourtsLoading } = useAdherentCourts(organizationId)
  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<string>(() => todayISO())
  const [pendingSlot, setPendingSlot] = useState<{ startTime: string } | null>(null)

  const activeCourts = useMemo(() => (courts ?? []).filter((c) => c.isActive), [courts])
  const courtsById = useMemo(() => new Map(activeCourts.map((c) => [c.id, c])), [activeCourts])
  const courtId = selectedCourtId ?? activeCourts[0]?.id
  const court = courtId ? courtsById.get(courtId) : undefined

  const { data: availability, isLoading: isAvailabilityLoading } = useAdherentAvailability(courtId, selectedDate)
  const { data: quota } = useAdherentWeeklyQuota(organizationId)

  if (isCourtsLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Réservation de courts</h2>
        <Skeleton className="h-40 w-full" />
      </section>
    )
  }

  if (activeCourts.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Réservation de courts</h2>

      <div className="flex flex-wrap gap-3">
        <Select value={courtId} onValueChange={setSelectedCourtId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Court" />
          </SelectTrigger>
          <SelectContent>
            {activeCourts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} · {c.sport === "padel" ? "Padel" : "Tennis"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={selectedDate}
          min={todayISO()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-[180px]"
        />
      </div>

      {quota && (
        <p className="text-sm text-muted-foreground">
          Cette semaine : {quota.weekday.used}
          {quota.weekday.limit != null ? `/${quota.weekday.limit}` : ""} en semaine · {quota.weekend.used}
          {quota.weekend.limit != null ? `/${quota.weekend.limit}` : ""} le week-end
        </p>
      )}

      <Card>
        <CardContent className="py-4">
          {isAvailabilityLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !availability || availability.slots.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun créneau pour cette date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availability.slots.map((slot) => (
                <Button
                  key={slot.startTime}
                  type="button"
                  variant={slot.available ? "outline" : "ghost"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => setPendingSlot({ startTime: slot.startTime })}
                >
                  {slot.startTime}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {court && pendingSlot && (
        <BookingConfirmDialog
          organizationId={organizationId}
          court={court}
          date={selectedDate}
          startTime={pendingSlot.startTime}
          onOpenChange={(open) => {
            if (!open) setPendingSlot(null)
          }}
          onSuccess={() => setPendingSlot(null)}
        />
      )}

      <MyBookingsList organizationId={organizationId} courtsById={courtsById} />
    </section>
  )
}

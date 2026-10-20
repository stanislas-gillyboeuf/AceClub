"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthCalendar } from "@/components/sections/demo-booking/month-calendar"
import {
  useCancelDemoBookingPublic,
  useDemoBookingAvailability,
  useDemoBookingByToken,
  useDemoBookingSlots,
  useRescheduleDemoBookingPublic,
} from "@/hooks/use-demo-booking-public"
import type { PublicSlot } from "@/types/demo-booking"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function todayYearMonthPlus(months: number): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function formatFullDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function ReschedulePanel({ cancelToken, onDone }: { cancelToken: string; onDone: () => void }) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const availability = useDemoBookingAvailability(yearMonth)
  const slots = useDemoBookingSlots(selectedDate)
  const reschedule = useRescheduleDemoBookingPublic()

  const availableDates = useMemo(() => new Set(availability.data?.dates ?? []), [availability.data])

  function handlePick(slot: PublicSlot) {
    reschedule.mutate(
      { cancelToken, startAt: slot.startAt },
      {
        onSuccess: () => {
          toast.success("Rendez-vous reporté")
          onDone()
        },
        onError: (err) => toast.error(err.message || "Ce créneau n'est plus disponible"),
      },
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <MonthCalendar
        yearMonth={yearMonth}
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onMonthChange={setYearMonth}
        minYearMonth={currentYearMonth()}
        maxYearMonth={todayYearMonthPlus(2)}
        isLoading={availability.isLoading}
      />
      <div className="space-y-2">
        {!selectedDate ? (
          <p className="text-sm text-mkt-light-fg-dim">Choisissez un nouveau jour.</p>
        ) : slots.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !slots.data?.slots.length ? (
          <p className="text-sm text-mkt-light-fg-dim">Plus aucun créneau ce jour-là.</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {slots.data.slots.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                disabled={reschedule.isPending}
                onClick={() => handlePick(slot)}
                className="w-full rounded-md border border-mkt-light-border px-4 py-2.5 text-left text-sm font-medium hover:border-mkt-accent hover:bg-mkt-accent/10"
              >
                {formatFullDate(slot.startAt)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ManageDemoBookingPage() {
  const params = useParams<{ cancelToken: string }>()
  const cancelToken = params.cancelToken

  const { data: booking, isLoading, isError } = useDemoBookingByToken(cancelToken)
  const cancelBooking = useCancelDemoBookingPublic()
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)

  if (isLoading) {
    return (
      <div className="mkt-light-section py-16 sm:py-24">
        <div className="mx-auto max-w-xl px-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="mkt-light-section py-16 sm:py-24">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p>Rendez-vous introuvable.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mkt-light-section py-16 sm:py-24">
      <div className="mx-auto max-w-xl space-y-6 px-6">
        <div className="rounded-2xl border border-mkt-light-border bg-mkt-light-raised p-8 text-center">
          <h1 className="font-display text-2xl uppercase tracking-tight">Votre démo Ace Club</h1>

          {booking.status === "cancelled" ? (
            <p className="mt-4 text-mkt-light-fg-dim">Ce rendez-vous a été annulé.</p>
          ) : (
            <>
              <p className="mt-4 text-mkt-light-fg-dim">{formatFullDate(booking.startAt)}</p>
              {booking.googleMeetLink ? (
                <a
                  href={booking.googleMeetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-primary underline"
                >
                  Lien Google Meet
                </a>
              ) : null}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" asChild>
                  <a href={`${API_URL}/api/demo-booking/${booking.cancelToken}/ics`}>
                    Ajouter à mon agenda
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setRescheduling((v) => !v)}>
                  Reporter
                </Button>
                {!confirmingCancel ? (
                  <Button variant="ghost" className="text-destructive" onClick={() => setConfirmingCancel(true)}>
                    Annuler
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Confirmer l&apos;annulation ?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={cancelBooking.isPending}
                      onClick={() =>
                        cancelBooking.mutate(booking.cancelToken, {
                          onSuccess: () => toast.success("Rendez-vous annulé"),
                        })
                      }
                    >
                      Oui
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmingCancel(false)}>
                      Non
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {rescheduling && booking.status === "confirmed" ? (
          <div className="rounded-2xl border border-mkt-light-border bg-mkt-light-raised p-6">
            <ReschedulePanel cancelToken={booking.cancelToken} onDone={() => setRescheduling(false)} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

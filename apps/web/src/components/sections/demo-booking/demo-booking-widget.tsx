"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Clock, Video, CheckCircle2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthCalendar } from "./month-calendar"
import {
  useCreateDemoBookingPublic,
  useDemoBookingAvailability,
  useDemoBookingSlots,
  useNoSlotContact,
} from "@/hooks/use-demo-booking-public"
import type { DemoBookingRole, PublicSlot, DemoBooking } from "@/types/demo-booking"

const ROLE_OPTIONS: { value: DemoBookingRole; label: string }[] = [
  { value: "president", label: "Président" },
  { value: "manager", label: "Gérant / Directeur" },
  { value: "coach", label: "Enseignant" },
  { value: "other", label: "Autre" },
]

const TIMEZONE_OPTIONS = [
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Indian/Reunion",
  "Pacific/Noumea",
]

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function todayYearMonthPlus(months: number): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function formatSlotLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function formatFullDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

function InfoPanel() {
  return (
    <div className="space-y-4">
      <Avatar className="h-14 w-14">
        <AvatarFallback className="bg-mkt-accent text-mkt-accent-foreground text-lg font-semibold">
          SG
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight">Démo Ace Club</h1>
        <p className="mt-1 text-sm text-mkt-light-fg-dim">Stanislas, fondateur d&apos;Ace Club</p>
      </div>
      <p className="text-sm text-mkt-light-fg-dim">
        On échange sur les besoins de votre club et je vous montre l&apos;application en direct —
        sans engagement.
      </p>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-mkt-light-fg-dim" />
        20 minutes
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Video className="h-4 w-4 text-mkt-light-fg-dim" />
        Google Meet
      </div>
    </div>
  )
}

function ConfirmationScreen({ booking, timeZone }: { booking: DemoBooking; timeZone: string }) {
  return (
    <div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-mkt-accent" />
      <h2 className="font-display text-2xl uppercase tracking-tight">C&apos;est confirmé</h2>
      <p className="text-mkt-light-fg-dim">{formatFullDate(booking.startAt, timeZone)}</p>
      <div className="flex flex-col items-center gap-2 pt-2">
        {booking.googleMeetLink ? (
          <Button asChild>
            <a href={booking.googleMeetLink} target="_blank" rel="noreferrer">
              Ouvrir le lien Google Meet
            </a>
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <a href={`${API_URL}/api/demo-booking/${booking.cancelToken}/ics`}>Ajouter à mon agenda</a>
        </Button>
        <Link
          href={`/demo/${booking.cancelToken}`}
          className="mt-2 text-sm text-mkt-light-fg-dim underline"
        >
          Annuler ou reporter ce rendez-vous
        </Link>
      </div>
    </div>
  )
}

function NoSlotFallback() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const noSlotContact = useNoSlotContact()

  if (sent) {
    return (
      <p className="text-sm text-mkt-light-fg-dim">
        Merci, on revient vers vous dès qu&apos;un créneau se libère.
      </p>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-mkt-light-border p-4">
      <p className="text-sm">
        Aucun créneau disponible pour le moment. Laissez votre email, on vous recontacte.
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="vous@club.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          disabled={!email || noSlotContact.isPending}
          onClick={() => noSlotContact.mutate(email, { onSuccess: () => setSent(true) })}
        >
          Envoyer
        </Button>
      </div>
    </div>
  )
}

function DemoBookingWidgetContent() {
  const searchParams = useSearchParams()
  const utmSource = searchParams.get("utm_source")

  const [yearMonth, setYearMonth] = useState(currentYearMonth)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null)
  const [timeZone, setTimeZone] = useState("Europe/Paris")
  const [createdBooking, setCreatedBooking] = useState<DemoBooking | null>(null)
  const [honeypot, setHoneypot] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [clubName, setClubName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<DemoBookingRole>("president")
  const [note, setNote] = useState("")

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) setTimeZone(detected)
    } catch {
      // Intl unsupported — keep the Europe/Paris default
    }
  }, [])

  const availability = useDemoBookingAvailability(yearMonth)
  const slots = useDemoBookingSlots(selectedDate)
  const createBooking = useCreateDemoBookingPublic()

  const availableDates = useMemo(
    () => new Set(availability.data?.dates ?? []),
    [availability.data],
  )
  const noSlotsThisMonth = !availability.isLoading && availableDates.size === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return

    createBooking.mutate(
      {
        startAt: selectedSlot.startAt,
        firstName,
        lastName,
        email,
        clubName,
        phone: phone || undefined,
        role,
        note: note || undefined,
        utmSource: utmSource || undefined,
        website: honeypot,
      },
      {
        onSuccess: (booking) => setCreatedBooking(booking),
        onError: (err) => {
          toast.error(err.message || "Ce créneau n'est plus disponible")
          setSelectedSlot(null)
          slots.refetch()
        },
      },
    )
  }

  if (createdBooking) {
    return <ConfirmationScreen booking={createdBooking} timeZone={timeZone} />
  }

  if (selectedSlot) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedSlot(null)}
          className="flex items-center gap-1 text-sm text-mkt-light-fg-dim hover:text-mkt-light-fg"
        >
          <ArrowLeft className="h-3 w-3" />
          {formatFullDate(selectedSlot.startAt, timeZone)}
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clubName">Nom du club *</Label>
              <Input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Votre rôle *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as DemoBookingRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full bg-mkt-accent text-mkt-accent-foreground hover:bg-mkt-accent/90"
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? "Confirmation..." : "Confirmer la démo"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-mkt-light-fg-dim">
          <CalendarDays className="h-4 w-4" />
          Fuseau horaire
        </div>
        <Select value={timeZone} onValueChange={setTimeZone}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set([timeZone, ...TIMEZONE_OPTIONS])).map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <MonthCalendar
          yearMonth={yearMonth}
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date)
          }}
          onMonthChange={setYearMonth}
          minYearMonth={currentYearMonth()}
          maxYearMonth={todayYearMonthPlus(2)}
          isLoading={availability.isLoading}
        />

        <div className="space-y-2">
          {!selectedDate ? (
            noSlotsThisMonth ? (
              <NoSlotFallback />
            ) : (
              <p className="text-sm text-mkt-light-fg-dim">
                Choisissez un jour disponible dans le calendrier.
              </p>
            )
          ) : slots.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !slots.data?.slots.length ? (
            <p className="text-sm text-mkt-light-fg-dim">Plus aucun créneau ce jour-là.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {slots.data.slots.map((slot) => (
                <button
                  key={slot.startAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className="w-full rounded-md border border-mkt-light-border px-4 py-2.5 text-left text-sm font-medium hover:border-mkt-accent hover:bg-mkt-accent/10"
                >
                  {formatSlotLabel(slot.startAt, timeZone)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DemoBookingWidget() {
  return (
    <div className="grid gap-10 rounded-2xl border border-mkt-light-border bg-mkt-light-raised p-6 sm:p-10 lg:grid-cols-[260px_1fr]">
      <InfoPanel />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DemoBookingWidgetContent />
      </Suspense>
    </div>
  )
}

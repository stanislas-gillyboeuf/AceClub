"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Trash2, CalendarOff, Link2, Link2Off } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  useDemoBookingAdminBlocks,
  useDemoBookingAdminBookings,
  useDemoBookingAdminSettings,
  useDemoBookingGoogleStatus,
} from "@/hooks/use-demo-booking-queries"
import {
  useCreateDemoBookingBlock,
  useDeleteDemoBookingBlock,
  useDisconnectDemoBookingGoogle,
  useGetDemoBookingGoogleAuthUrl,
  useUpdateDemoBookingSettings,
} from "@/hooks/use-demo-booking-mutations"
import type { DemoAvailabilityRule } from "@/types/demo-booking"

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  })
}

function GoogleConnectionCard() {
  const { data: status, isLoading } = useDemoBookingGoogleStatus()
  const getAuthUrl = useGetDemoBookingGoogleAuthUrl()
  const disconnect = useDisconnectDemoBookingGoogle()

  function handleConnect() {
    getAuthUrl.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.url
      },
      onError: () => toast.error("Impossible de démarrer la connexion Google"),
    })
  }

  const connected = status?.status === "connected"
  const inError = status?.status === "error"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Agenda</CardTitle>
        <CardDescription>
          L&apos;agenda connecté sert à calculer les disponibilités et à créer les RDV avec un lien
          Google Meet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          <div className="flex items-center gap-3">
            <Badge variant={connected ? "default" : inError ? "destructive" : "secondary"}>
              {connected ? "Connecté" : inError ? "Erreur" : "Non connecté"}
            </Badge>
            {inError && status?.lastErrorMessage ? (
              <span className="text-sm text-muted-foreground">{status.lastErrorMessage}</span>
            ) : null}
          </div>
        )}

        {connected ? (
          <Button
            variant="outline"
            onClick={() => disconnect.mutate()}
            disabled={disconnect.isPending}
          >
            <Link2Off className="mr-2 h-4 w-4" />
            Déconnecter
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={getAuthUrl.isPending}>
            <Link2 className="mr-2 h-4 w-4" />
            Connecter mon agenda
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function SettingsCard() {
  const { data, isLoading } = useDemoBookingAdminSettings()
  const updateSettings = useUpdateDemoBookingSettings()

  const [duration, setDuration] = useState("20")
  const [bufferBefore, setBufferBefore] = useState("10")
  const [bufferAfter, setBufferAfter] = useState("10")
  const [minNotice, setMinNotice] = useState("8")
  const [horizon, setHorizon] = useState("21")
  const [maxPerDay, setMaxPerDay] = useState("3")
  const [timezone, setTimezone] = useState("Europe/Paris")
  const [rules, setRules] = useState<DemoAvailabilityRule[]>([])

  useEffect(() => {
    if (!data) return
    setDuration(String(data.settings.demoDurationMinutes))
    setBufferBefore(String(data.settings.bufferBeforeMinutes))
    setBufferAfter(String(data.settings.bufferAfterMinutes))
    setMinNotice(String(data.settings.minNoticeHours))
    setHorizon(String(data.settings.horizonDays))
    setMaxPerDay(String(data.settings.maxPerDay))
    setTimezone(data.settings.referenceTimezone)
    setRules(data.rules)
  }, [data])

  function addRule() {
    setRules((prev) => [...prev, { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }])
  }

  function updateRule(index: number, patch: Partial<DemoAvailabilityRule>) {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    updateSettings.mutate({
      demoDurationMinutes: Number(duration),
      bufferBeforeMinutes: Number(bufferBefore),
      bufferAfterMinutes: Number(bufferAfter),
      minNoticeHours: Number(minNotice),
      horizonDays: Number(horizon),
      maxPerDay: Number(maxPerDay),
      referenceTimezone: timezone,
      rules,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réglages de la démo</CardTitle>
        <CardDescription>Durée, tampons, préavis et horizon de réservation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Durée (min)</Label>
            <Input type="number" min={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tampon avant (min)</Label>
            <Input type="number" min={0} value={bufferBefore} onChange={(e) => setBufferBefore(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tampon après (min)</Label>
            <Input type="number" min={0} value={bufferAfter} onChange={(e) => setBufferAfter(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Préavis minimum (h)</Label>
            <Input type="number" min={0} value={minNotice} onChange={(e) => setMinNotice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Horizon (jours)</Label>
            <Input type="number" min={1} value={horizon} onChange={(e) => setHorizon(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Max par jour</Label>
            <Input type="number" min={0} value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Disponibilités hebdomadaires</Label>
            <Button variant="outline" size="sm" onClick={addRule}>
              <Plus className="mr-1 h-3 w-3" />
              Ajouter
            </Button>
          </div>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune plage définie</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={String(rule.dayOfWeek)}
                    onValueChange={(v) => updateRule(index, { dayOfWeek: Number(v) })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_LABELS.map((label, day) => (
                        <SelectItem key={day} value={String(day)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={rule.startTime}
                    onChange={(e) => updateRule(index, { startTime: e.target.value })}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">à</span>
                  <Input
                    type="time"
                    value={rule.endTime}
                    onChange={(e) => updateRule(index, { endTime: e.target.value })}
                    className="w-28"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeRule(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  )
}

function BlocksCard() {
  const { data, isLoading } = useDemoBookingAdminBlocks()
  const createBlock = useCreateDemoBookingBlock()
  const deleteBlock = useDeleteDemoBookingBlock()
  const [date, setDate] = useState("")
  const [reason, setReason] = useState("")

  function handleAdd() {
    if (!date) return
    createBlock.mutate(
      { date, reason: reason || undefined },
      {
        onSuccess: () => {
          setDate("")
          setReason("")
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocages manuels</CardTitle>
        <CardDescription>Bloque une journée entière (congés, indisponibilité...).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Raison (optionnel)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Congés" />
          </div>
          <Button onClick={handleAdd} disabled={!date || createBlock.isPending}>
            <CalendarOff className="mr-2 h-4 w-4" />
            Bloquer
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : !data?.blocks.length ? (
          <p className="text-sm text-muted-foreground">Aucun blocage</p>
        ) : (
          <div className="space-y-2">
            {data.blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">
                  {block.date ?? `${formatDateTime(block.startAt!)} – ${formatDateTime(block.endAt!)}`}
                  {block.reason ? ` — ${block.reason}` : ""}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteBlock.mutate(block.id)}
                  disabled={deleteBlock.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BookingsCard() {
  const [upcoming, setUpcoming] = useState(true)
  const { data, isLoading } = useDemoBookingAdminBookings(upcoming)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Réservations</CardTitle>
          <CardDescription>Démos planifiées par les prospects.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant={upcoming ? "default" : "outline"} size="sm" onClick={() => setUpcoming(true)}>
            À venir
          </Button>
          <Button variant={!upcoming ? "default" : "outline"} size="sm" onClick={() => setUpcoming(false)}>
            Historique
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data?.bookings.length ? (
          <p className="text-sm text-muted-foreground">Aucune réservation</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Prospect</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Meet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{formatDateTime(booking.startAt)}</TableCell>
                  <TableCell>
                    {booking.firstName} {booking.lastName}
                    <div className="text-xs text-muted-foreground">{booking.email}</div>
                  </TableCell>
                  <TableCell>{booking.clubName}</TableCell>
                  <TableCell>{booking.role}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status === "confirmed" ? "Confirmé" : "Annulé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.googleMeetLink ? (
                      <a
                        href={booking.googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Lien
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function DemoBookingPageContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("error")
    if (connected) toast.success("Agenda Google connecté")
    if (error) toast.error("Échec de la connexion Google agenda")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-tight">RDV démo</h1>
        <p className="text-muted-foreground">
          Page de prise de rendez-vous publique sur /demo
        </p>
      </div>

      <GoogleConnectionCard />
      <SettingsCard />
      <BlocksCard />
      <BookingsCard />
    </div>
  )
}

export default function DemoBookingPage() {
  return (
    <Suspense fallback={null}>
      <DemoBookingPageContent />
    </Suspense>
  )
}

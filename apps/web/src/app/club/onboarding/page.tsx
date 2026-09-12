"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateCourt, useUpdateCourt, useUpsertClubCourtSettings } from "@/hooks/use-club-court-mutations"
import { useCreateDuesType } from "@/hooks/use-dues-mutations"
import { useCompleteOnboarding } from "@/hooks/use-club-admin-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { CourtCancellationPolicy, CourtSport } from "@/types/court"

const STEPS = ["Courts", "Réglages", "Annulation", "Cotisations"] as const

function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : i < currentIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-sm ${i === currentIndex ? "font-medium" : "text-muted-foreground"}`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 ? <div className="h-px w-8 bg-border" /> : null}
        </div>
      ))}
    </div>
  )
}

interface CreatedCourt {
  id: string
  name: string
  sport: CourtSport
}

export default function ClubOnboardingPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const [step, setStep] = useState(0)

  const createCourt = useCreateCourt()
  const updateCourt = useUpdateCourt()
  const upsertSettings = useUpsertClubCourtSettings()
  const createDuesType = useCreateDuesType()
  const completeOnboarding = useCompleteOnboarding()

  const [courts, setCourts] = useState<CreatedCourt[]>([])
  const [courtName, setCourtName] = useState("")
  const [courtSport, setCourtSport] = useState<CourtSport>("tennis")

  const [openingHour, setOpeningHour] = useState("8")
  const [closingHour, setClosingHour] = useState("22")
  const [weekdayLimited, setWeekdayLimited] = useState(false)
  const [weekdayLimit, setWeekdayLimit] = useState("")
  const [weekendLimited, setWeekendLimited] = useState(false)
  const [weekendLimit, setWeekendLimit] = useState("")
  const [windowLimited, setWindowLimited] = useState(false)
  const [windowLimit, setWindowLimit] = useState("")

  const [cancellationPolicy, setCancellationPolicy] =
    useState<CourtCancellationPolicy>("anytime")
  const [cancellationWindowHours, setCancellationWindowHours] = useState("24")

  const [duesName, setDuesName] = useState("Cotisation annuelle")
  const [duesAmount, setDuesAmount] = useState("")

  function handleAddCourt() {
    if (!courtName.trim()) return
    createCourt.mutate(
      { organizationId, name: courtName.trim(), sport: courtSport },
      {
        onSuccess: (created) => {
          setCourts((prev) => [...prev, { id: created.id, name: created.name, sport: created.sport }])
          setCourtName("")
        },
      },
    )
  }

  function handleSaveSettings() {
    upsertSettings.mutate(
      {
        organizationId,
        openingHour: Number(openingHour),
        closingHour: Number(closingHour),
        maxBookingsPerWeekWeekday: weekdayLimited ? Number(weekdayLimit) : null,
        maxBookingsPerWeekWeekend: weekendLimited ? Number(weekendLimit) : null,
        bookingWindowDays: windowLimited ? Number(windowLimit) : null,
      },
      { onSuccess: () => setStep(2) },
    )
  }

  async function handleSaveCancellationPolicy() {
    await Promise.all(
      courts.map((c) =>
        updateCourt.mutateAsync({
          courtId: c.id,
          cancellationPolicy,
          cancellationWindowHours:
            cancellationPolicy === "window" ? Number(cancellationWindowHours) : undefined,
        }),
      ),
    )
    setStep(3)
  }

  function finishOnboarding() {
    completeOnboarding.mutate(organizationId, {
      onSuccess: () => router.replace("/club/dashboard"),
    })
  }

  function handleCreateDuesAndFinish() {
    if (!duesName.trim() || !duesAmount) {
      finishOnboarding()
      return
    }
    createDuesType.mutate(
      {
        organizationId,
        name: duesName.trim(),
        amountCents: Math.round(Number(duesAmount) * 100),
      },
      { onSuccess: finishOnboarding, onError: finishOnboarding },
    )
  }

  const settingsValid =
    Number.isInteger(Number(openingHour)) &&
    Number.isInteger(Number(closingHour)) &&
    Number(closingHour) > Number(openingHour) &&
    (!weekdayLimited || Number(weekdayLimit) > 0) &&
    (!weekendLimited || Number(weekendLimit) > 0) &&
    (!windowLimited || Number(windowLimit) > 0)

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenue sur Ace Club</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurons votre club en quelques étapes.
        </p>
      </div>

      <StepIndicator currentIndex={step} />

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Vos courts</CardTitle>
            <CardDescription>Ajoutez au moins un court pour commencer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nom du court (ex: Court 1)"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              />
              <Select value={courtSport} onValueChange={(v: CourtSport) => setCourtSport(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="padel">Padel</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddCourt} disabled={!courtName.trim() || createCourt.isPending}>
                Ajouter
              </Button>
            </div>

            {courts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {courts.map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name} · {c.sport === "tennis" ? "Tennis" : "Padel"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun court ajouté pour le moment.</p>
            )}

            <Button className="w-full" disabled={courts.length === 0} onClick={() => setStep(1)}>
              Suivant
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Horaires et quotas</CardTitle>
            <CardDescription>
              Ces réglages s&apos;appliquent aussi bien sur l&apos;app mobile que sur ce dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="opening">Ouverture</Label>
                <Input
                  id="opening"
                  type="number"
                  min={0}
                  max={23}
                  value={openingHour}
                  onChange={(e) => setOpeningHour(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="closing">Fermeture</Label>
                <Input
                  id="closing"
                  type="number"
                  min={1}
                  max={24}
                  value={closingHour}
                  onChange={(e) => setClosingHour(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="flex-1">Quota hebdo — semaine</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Illimité</span>
                <Switch checked={weekdayLimited} onCheckedChange={setWeekdayLimited} />
                {weekdayLimited ? (
                  <Input
                    type="number"
                    min={1}
                    value={weekdayLimit}
                    onChange={(e) => setWeekdayLimit(e.target.value)}
                    className="w-20"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="flex-1">Quota hebdo — week-end</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Illimité</span>
                <Switch checked={weekendLimited} onCheckedChange={setWeekendLimited} />
                {weekendLimited ? (
                  <Input
                    type="number"
                    min={1}
                    value={weekendLimit}
                    onChange={(e) => setWeekendLimit(e.target.value)}
                    className="w-20"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="flex-1">Fenêtre de réservation (J+N)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Illimitée</span>
                <Switch checked={windowLimited} onCheckedChange={setWindowLimited} />
                {windowLimited ? (
                  <Input
                    type="number"
                    min={1}
                    value={windowLimit}
                    onChange={(e) => setWindowLimit(e.target.value)}
                    className="w-20"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Retour
              </Button>
              <Button
                className="flex-1"
                disabled={!settingsValid || upsertSettings.isPending}
                onClick={handleSaveSettings}
              >
                {upsertSettings.isPending ? "Enregistrement..." : "Suivant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Politique d&apos;annulation</CardTitle>
            <CardDescription>
              Appliquée à tous les courts que vous venez de créer — modifiable plus tard par court.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Politique</Label>
              <Select
                value={cancellationPolicy}
                onValueChange={(v: CourtCancellationPolicy) => setCancellationPolicy(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anytime">À tout moment</SelectItem>
                  <SelectItem value="window">Délai minimum</SelectItem>
                  <SelectItem value="disabled">Non autorisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cancellationPolicy === "window" ? (
              <div className="space-y-1.5">
                <Label htmlFor="cancel-window">Délai (heures)</Label>
                <Input
                  id="cancel-window"
                  type="number"
                  min={1}
                  value={cancellationWindowHours}
                  onChange={(e) => setCancellationWindowHours(e.target.value)}
                />
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button
                className="flex-1"
                disabled={
                  updateCourt.isPending ||
                  (cancellationPolicy === "window" && Number(cancellationWindowHours) <= 0)
                }
                onClick={handleSaveCancellationPolicy}
              >
                {updateCourt.isPending ? "Enregistrement..." : "Suivant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Première cotisation</CardTitle>
            <CardDescription>Optionnel — vous pourrez en créer d&apos;autres ensuite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dues-name">Nom</Label>
              <Input id="dues-name" value={duesName} onChange={(e) => setDuesName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dues-amount">Montant (€)</Label>
              <Input
                id="dues-amount"
                type="number"
                min={0}
                value={duesAmount}
                onChange={(e) => setDuesAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button
                variant="ghost"
                onClick={finishOnboarding}
                disabled={completeOnboarding.isPending}
              >
                Passer cette étape
              </Button>
              <Button
                className="flex-1"
                disabled={createDuesType.isPending || completeOnboarding.isPending}
                onClick={handleCreateDuesAndFinish}
              >
                {createDuesType.isPending || completeOnboarding.isPending
                  ? "Finalisation..."
                  : "Terminer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useClubCourtSettings } from "@/hooks/use-club-court-queries"
import { useUpsertClubCourtSettings } from "@/hooks/use-club-court-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

function LimitRow({
  label,
  limited,
  onToggleLimited,
  value,
  onChangeValue,
}: {
  label: string
  limited: boolean
  onToggleLimited: (v: boolean) => void
  value: string
  onChangeValue: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Illimité</span>
        <Switch checked={limited} onCheckedChange={onToggleLimited} />
        {limited ? (
          <Input
            type="number"
            min={1}
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            className="w-20"
          />
        ) : null}
      </div>
    </div>
  )
}

export default function ClubCourtRulesPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const { data: settings } = useClubCourtSettings(organizationId)
  const upsertSettings = useUpsertClubCourtSettings()

  const [openingHour, setOpeningHour] = useState("8")
  const [closingHour, setClosingHour] = useState("22")
  const [weekdayLimited, setWeekdayLimited] = useState(false)
  const [weekdayLimit, setWeekdayLimit] = useState("")
  const [weekendLimited, setWeekendLimited] = useState(false)
  const [weekendLimit, setWeekendLimit] = useState("")
  const [windowLimited, setWindowLimited] = useState(false)
  const [windowLimit, setWindowLimit] = useState("")

  useEffect(() => {
    if (!settings) return
    setOpeningHour(String(settings.openingHour))
    setClosingHour(String(settings.closingHour))
    setWeekdayLimited(settings.maxBookingsPerWeekWeekday != null)
    setWeekdayLimit(
      settings.maxBookingsPerWeekWeekday != null ? String(settings.maxBookingsPerWeekWeekday) : "",
    )
    setWeekendLimited(settings.maxBookingsPerWeekWeekend != null)
    setWeekendLimit(
      settings.maxBookingsPerWeekWeekend != null ? String(settings.maxBookingsPerWeekWeekend) : "",
    )
    setWindowLimited(settings.bookingWindowDays != null)
    setWindowLimit(settings.bookingWindowDays != null ? String(settings.bookingWindowDays) : "")
  }, [settings])

  const openingValue = Number(openingHour)
  const closingValue = Number(closingHour)
  const isValid =
    Number.isInteger(openingValue) &&
    Number.isInteger(closingValue) &&
    openingValue >= 0 &&
    openingValue <= 23 &&
    closingValue >= 1 &&
    closingValue <= 24 &&
    closingValue > openingValue &&
    (!weekdayLimited || Number(weekdayLimit) > 0) &&
    (!weekendLimited || Number(weekendLimit) > 0) &&
    (!windowLimited || Number(windowLimit) > 0)

  function handleSave() {
    upsertSettings.mutate({
      organizationId,
      openingHour: openingValue,
      closingHour: closingValue,
      maxBookingsPerWeekWeekday: weekdayLimited ? Number(weekdayLimit) : null,
      maxBookingsPerWeekWeekend: weekendLimited ? Number(weekendLimit) : null,
      bookingWindowDays: windowLimited ? Number(windowLimit) : null,
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/courts")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux courts
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Règles de réservation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ces règles s&apos;appliquent aussi bien sur l&apos;app mobile que sur ce dashboard.
      </p>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Horaires d&apos;ouverture</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1 space-y-1.5">
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
            <div className="flex-1 space-y-1.5">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quotas hebdomadaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitRow
              label="Réservations en semaine"
              limited={weekdayLimited}
              onToggleLimited={setWeekdayLimited}
              value={weekdayLimit}
              onChangeValue={setWeekdayLimit}
            />
            <LimitRow
              label="Réservations en week-end"
              limited={weekendLimited}
              onToggleLimited={setWeekendLimited}
              value={weekendLimit}
              onChangeValue={setWeekendLimit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fenêtre de réservation</CardTitle>
          </CardHeader>
          <CardContent>
            <LimitRow
              label="Jours à l'avance (J+N)"
              limited={windowLimited}
              onToggleLimited={setWindowLimited}
              value={windowLimit}
              onChangeValue={setWindowLimit}
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={!isValid || upsertSettings.isPending}>
          {upsertSettings.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}

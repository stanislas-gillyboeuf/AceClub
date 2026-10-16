"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useClubNotificationSettings } from "@/hooks/use-club-notification-settings-queries"
import { useUpdateClubNotificationSettings } from "@/hooks/use-club-notification-settings-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { ClubNotificationSettings } from "@/types/notification-settings"

const DEFAULT_SETTINGS: ClubNotificationSettings = {
  streakWarning: true,
  challengeAssigned: true,
  matchRequestUpdate: true,
  matchLiked: true,
  newMessage: true,
  bookingReminder: true,
  classReminder: true,
  coachMessage: true,
  cotisationRequestEmail: true,
  cotisationReminderEmail: true,
  invitationAccepted: true,
  clubAnnouncement: true,
  memberAlertDigestEmail: true,
}

interface SettingRow {
  key: keyof ClubNotificationSettings
  label: string
}

interface Category {
  title: string
  rows: SettingRow[]
}

const CATEGORIES: Category[] = [
  {
    title: "Défis",
    rows: [
      { key: "streakWarning", label: "Alerte série en danger (push)" },
      { key: "challengeAssigned", label: "Nouveaux défis de la semaine (push)" },
    ],
  },
  {
    title: "Matchs / Matching",
    rows: [
      { key: "matchRequestUpdate", label: "Demande de match acceptée/refusée (push)" },
      { key: "matchLiked", label: "Un joueur a liké ton profil (push)" },
    ],
  },
  {
    title: "Messagerie",
    rows: [{ key: "newMessage", label: "Nouveau message (push)" }],
  },
  {
    title: "Réservations / Cours",
    rows: [
      { key: "bookingReminder", label: "Rappel de réservation de court (push)" },
      { key: "classReminder", label: "Rappel de cours (push)" },
      { key: "coachMessage", label: "Message d'un coach (push)" },
    ],
  },
  {
    title: "Cotisations",
    rows: [
      { key: "cotisationRequestEmail", label: "Demande de paiement de cotisation (email)" },
      { key: "cotisationReminderEmail", label: "Relance de cotisation impayée (email)" },
    ],
  },
  {
    title: "Actus du club",
    rows: [
      { key: "invitationAccepted", label: "Invitation acceptée (push)" },
      { key: "clubAnnouncement", label: "Annonce du club (push + email)" },
      { key: "memberAlertDigestEmail", label: "Digest quotidien des alertes adhérents (email)" },
    ],
  },
]

export default function ClubNotificationsPage() {
  const { organizationId } = useClubAdminContext()
  const { data: settings } = useClubNotificationSettings(organizationId)
  const updateSettings = useUpdateClubNotificationSettings()

  const [local, setLocal] = useState<ClubNotificationSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (settings) setLocal(settings)
  }, [settings])

  function toggle(key: keyof ClubNotificationSettings, value: boolean) {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    updateSettings.mutate({ organizationId, ...local })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choisissez quelles notifications sont envoyées à vos adhérents. Un adhérent qui a
        désactivé une notification depuis son téléphone ne la recevra pas, même si elle est
        activée ici.
      </p>

      <div className="mt-6 space-y-6">
        {CATEGORIES.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.rows.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={row.key} className="flex-1 font-normal">
                    {row.label}
                  </Label>
                  <Switch
                    id={row.key}
                    checked={local[row.key]}
                    onCheckedChange={(checked) => toggle(row.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}

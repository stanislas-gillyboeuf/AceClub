"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CoachBadgeRow } from "@/components/custom/coach-badge-row"
import { SuggestSlotDialog } from "@/components/custom/suggest-slot-dialog"
import { useHomeBoard } from "@/hooks/use-club-dashboard-queries"
import { useRemindMember } from "@/hooks/use-club-admin-mutations"
import { useMarkDuesPaid, useSendDuesReminder } from "@/hooks/use-dues-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { MemberAlert, SlotToFill } from "@/types/club-dashboard"

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-full border bg-card px-3 py-1.5">
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
}

function formatAmount(amountCents: number) {
  return (amountCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

const ALERT_LABELS: Record<MemberAlert["type"], { label: string; tone: string }> = {
  license_expired: { label: "Licence expirée", tone: "bg-red-100 text-red-800 hover:bg-red-100" },
  license_expiring: { label: "Licence bientôt expirée", tone: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  medical_expired: { label: "Certificat médical expiré", tone: "bg-red-100 text-red-800 hover:bg-red-100" },
  medical_expiring: {
    label: "Certificat médical bientôt expiré",
    tone: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  dues_overdue: { label: "Cotisation en retard", tone: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
}

const DEFAULT_REMINDER_MESSAGE: Record<MemberAlert["type"], string> = {
  license_expired: "Merci de mettre à jour votre licence FFT auprès du club.",
  license_expiring: "Votre licence FFT arrive à expiration — merci de la renouveler.",
  medical_expired: "Merci de fournir un certificat médical à jour auprès du club.",
  medical_expiring: "Votre certificat médical arrive à expiration — merci de le renouveler.",
  dues_overdue: "",
}

function ColumnCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-2.5">{children}</CardContent>
    </Card>
  )
}

function EmptyColumn({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>
}

export default function ClubAdminDashboardPage() {
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useHomeBoard(organizationId)
  const remindMember = useRemindMember()
  const sendDuesReminder = useSendDuesReminder()
  const markDuesPaid = useMarkDuesPaid()
  const [suggestSlotTarget, setSuggestSlotTarget] = useState<SlotToFill | null>(null)

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  function handleRemindMember(alert: MemberAlert) {
    if (alert.type === "dues_overdue") {
      if (alert.assignmentId) sendDuesReminder.mutate({ assignmentId: alert.assignmentId })
      return
    }
    remindMember.mutate({
      organizationId,
      userId: alert.userId,
      message: DEFAULT_REMINDER_MESSAGE[alert.type],
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <CoachBadgeRow coaches={data.coachBadges} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatChip label="membres" value={String(data.stats.activeMembers)} />
        <StatChip label="courts actifs" value={String(data.stats.activeCourts)} />
        <StatChip label="occupation cette semaine" value={`${data.stats.occupancyPercent}%`} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ColumnCard title="Cours aujourd'hui">
          {data.coursesToday.length === 0 ? (
            <EmptyColumn label="Aucun cours aujourd'hui." />
          ) : (
            data.coursesToday.map((c) => (
              <Link
                key={c.occurrenceId}
                href={c.courseId ? `/club/courses/${c.courseId}` : "/club/courses"}
                className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <p className="text-sm font-medium">{c.courseName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.coachName} · {c.courtName}
                </p>
                <p className="mt-1 text-xs font-medium">
                  {formatDateTime(c.startAt)}–{formatDateTime(c.endAt)}
                </p>
              </Link>
            ))
          )}
        </ColumnCard>

        <ColumnCard title="Créneaux à remplir">
          {data.slotsToFill.length === 0 ? (
            <EmptyColumn label="Aucun créneau libre dans les 48h." />
          ) : (
            data.slotsToFill.map((slot, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{slot.courtName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(slot.date)} à {slot.hour}h
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setSuggestSlotTarget(slot)}
                >
                  Suggérer à des membres
                </Button>
              </div>
            ))
          )}
        </ColumnCard>

        <ColumnCard title="Alertes membres">
          {data.memberAlerts.length === 0 ? (
            <EmptyColumn label="Aucune alerte en cours." />
          ) : (
            data.memberAlerts.map((alert, i) => {
              const { label, tone } = ALERT_LABELS[alert.type]
              const isPending =
                alert.type === "dues_overdue"
                  ? sendDuesReminder.isPending && sendDuesReminder.variables?.assignmentId === alert.assignmentId
                  : remindMember.isPending && remindMember.variables?.userId === alert.userId
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border p-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={alert.userImage ?? undefined} alt={alert.userName} />
                    <AvatarFallback className="text-xs">{initials(alert.userName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{alert.userName}</p>
                    <Badge className={`mt-0.5 text-[11px] ${tone}`}>{label}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={isPending}
                      onClick={() => handleRemindMember(alert)}
                    >
                      {isPending ? "..." : "Relancer"}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </ColumnCard>

        <ColumnCard title="Nouveaux membres">
          {data.newMembers.length === 0 ? (
            <EmptyColumn label="Aucune adhésion récente." />
          ) : (
            data.newMembers.map((m) => (
              <Link
                key={m.userId}
                href={`/club/members/${m.userId}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.image ?? undefined} alt={m.name} />
                    <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Depuis le {formatDate(m.memberSince)}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {m.hasLicense ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                    Licence
                  </span>
                  <span className="flex items-center gap-1">
                    {m.hasBooked ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                    1ère résa
                  </span>
                </div>
              </Link>
            ))
          )}
        </ColumnCard>

        <Link href="/club/members" className="block h-full">
          <Card className="flex h-full flex-col transition-colors hover:bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Membres les plus actifs</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2.5">
              {data.topPlayers.length === 0 ? (
                <EmptyColumn label="Pas encore de réservations." />
              ) : (
                data.topPlayers.map((p, i) => (
                  <div key={p.userId} className="flex items-center gap-2.5">
                    <span className="w-4 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={p.image ?? undefined} alt={p.name} />
                      <AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {p.bookingCount} résa{p.bookingCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ))
              )}
              <p className="pt-1 text-xs text-muted-foreground">90 derniers jours · Voir tous les membres →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cotisations à échéance (30 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.duesDueSoon.length === 0 ? (
            <EmptyColumn label="Aucune cotisation à échéance proche." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Cotisation</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.duesDueSoon.map((d) => (
                  <TableRow key={d.assignmentId}>
                    <TableCell>{d.userName}</TableCell>
                    <TableCell>{d.duesTypeName}</TableCell>
                    <TableCell>{d.dueDate ? formatDate(d.dueDate) : "—"}</TableCell>
                    <TableCell>{formatAmount(d.amountCents)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={sendDuesReminder.isPending}
                          onClick={() => sendDuesReminder.mutate({ assignmentId: d.assignmentId })}
                        >
                          Relancer
                        </Button>
                        <Button
                          size="sm"
                          disabled={markDuesPaid.isPending}
                          onClick={() => markDuesPaid.mutate({ assignmentId: d.assignmentId })}
                        >
                          Marquer payé
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SuggestSlotDialog
        organizationId={organizationId}
        slot={suggestSlotTarget}
        onOpenChange={(open) => {
          if (!open) setSuggestSlotTarget(null)
        }}
      />
    </div>
  )
}

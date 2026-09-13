"use client"

import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useHomeBoard } from "@/hooks/use-club-dashboard-queries"
import { useMarkDuesPaid, useSendDuesReminder } from "@/hooks/use-dues-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

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

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-full border bg-card px-3 py-1.5">
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
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
  const sendDuesReminder = useSendDuesReminder()
  const markDuesPaid = useMarkDuesPaid()

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
          <CardTitle>Taux d&apos;occupation des terrains</CardTitle>
          <CardDescription>Sur les 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.occupancyByDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} unit="%" width={40} domain={[0, 100]} />
              <Tooltip formatter={(value?: number) => [`${value ?? 0}%`, "Occupation"]} />
              <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
    </div>
  )
}

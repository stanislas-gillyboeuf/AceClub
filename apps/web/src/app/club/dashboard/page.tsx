"use client"

import { Users, LayoutGrid, TrendingUp, TrendingDown } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useClubDashboardSummary } from "@/hooks/use-club-dashboard-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {hint}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ClubAdminDashboardPage() {
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useClubDashboardSummary(organizationId)

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  const { occupancy } = data
  const delta = occupancy.deltaPercentPoints
  const trendUp = delta >= 0

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          label="Membres"
          value={String(data.activeMembers)}
        />
        <StatCard
          icon={<LayoutGrid className="h-5 w-5 text-muted-foreground" />}
          label="Courts actifs"
          value={String(data.activeCourtsCount)}
        />
        <StatCard
          icon={
            trendUp ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )
          }
          label="Occupation cette semaine"
          value={`${occupancy.currentWeekPercent}%`}
          hint={
            <span
              className={`text-xs font-medium ${trendUp ? "text-emerald-600" : "text-red-600"}`}
            >
              {trendUp ? "+" : ""}
              {delta} pts vs. sem. dernière
            </span>
          }
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Taux d&apos;occupation des courts</CardTitle>
          <CardDescription>Sur les 6 dernières semaines</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={occupancy.weeklyTrend}>
              <defs>
                <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="weekLabel" fontSize={12} />
              <YAxis fontSize={12} unit="%" width={40} domain={[0, 100]} />
              <Tooltip formatter={(value?: number) => [`${value ?? 0}%`, "Occupation"]} />
              <Area
                type="monotone"
                dataKey="percent"
                stroke="hsl(var(--primary))"
                fill="url(#occupancyFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

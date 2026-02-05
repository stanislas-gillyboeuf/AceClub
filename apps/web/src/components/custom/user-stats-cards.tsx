"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Trophy,
  Flame,
  Swords,
  Target,
  TrendingUp,
  Medal,
} from "lucide-react"
import type { UserStats } from "@/types/admin"

interface StatsCardsProps {
  stats: UserStats
}

export function UserStatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Aces",
      value: stats.level.totalAces.toLocaleString(),
      icon: Trophy,
    },
    {
      title: "Niveau",
      value: stats.level.currentLevel,
      icon: Medal,
    },
    {
      title: "Streak actuel",
      value: `${stats.streak.currentStreak} sem.`,
      icon: Flame,
    },
    {
      title: "Plus long streak",
      value: `${stats.streak.longestStreak} sem.`,
      icon: TrendingUp,
    },
    {
      title: "Matchs joués",
      value: stats.matches.total,
      icon: Swords,
    },
    {
      title: "Win Rate",
      value: `${stats.matches.winRate}%`,
      icon: Target,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

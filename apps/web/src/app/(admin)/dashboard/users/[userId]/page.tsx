"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserStatsCards } from "@/components/custom/user-stats-cards"
import { AcesChart } from "@/components/custom/charts/aces-chart"
import { MatchChart } from "@/components/custom/charts/match-chart"
import { BadgeChart } from "@/components/custom/charts/badge-chart"
import {
  SetRoleDialog,
  SetPasswordDialog,
  BanUserDialog,
  UnbanUserDialog,
} from "@/components/custom/user-actions"
import { useUserStats, useAdminUsers } from "@/hooks/use-admin-queries"
import type { User } from "@/types/admin"

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const { data: stats, isLoading: statsLoading } = useUserStats(userId)

  // Fetch the user data by ID using the filter approach
  const { data: usersData, isLoading: userLoading } = useAdminUsers({
    filterField: "id",
    filterValue: userId,
    limit: 1,
  })

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)

  const user: User | null = usersData?.users?.[0] ?? null

  const isLoading = statsLoading || userLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Détail utilisateur</h1>
      </div>

      {/* User info card */}
      {user && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
                <Badge variant={user.banned ? "destructive" : "outline"}>
                  {user.banned ? "Banni" : "Actif"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Inscrit le {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Mot de passe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoleDialogOpen(true)}
              >
                Changer rôle
              </Button>
              {user.banned ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnbanDialogOpen(true)}
                >
                  Débannir
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBanDialogOpen(true)}
                >
                  Bannir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {stats && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="matches">Matchs</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-6">
            <UserStatsCards stats={stats} />
            <AcesChart data={stats.acesHistory} />
          </TabsContent>

          {/* Matches tab */}
          <TabsContent value="matches" className="space-y-6">
            <MatchChart wins={stats.matches.wins} losses={stats.matches.losses} />
            <Card>
              <CardHeader>
                <CardTitle>Derniers matchs</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.matches.recent.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucun match
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Côté</TableHead>
                        <TableHead>Résultat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.matches.recent.map((m) => (
                        <TableRow key={m.matchId}>
                          <TableCell>
                            {formatDate(m.finishedAt ?? m.scheduledAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{m.status}</Badge>
                          </TableCell>
                          <TableCell>{m.side}</TableCell>
                          <TableCell>
                            {m.status === "finished" ? (
                              <Badge
                                variant={m.isWinner ? "default" : "destructive"}
                              >
                                {m.isWinner ? "Victoire" : "Défaite"}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges tab */}
          <TabsContent value="badges" className="space-y-6">
            <BadgeChart badges={stats.badges} />
            <Card>
              <CardHeader>
                <CardTitle>
                  Badges débloqués ({stats.badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.badges.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Aucun badge
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.badges.map((b) => (
                      <div
                        key={b.badgeId}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        {b.imageUrl && (
                          <img
                            src={b.imageUrl}
                            alt={b.nameFr}
                            className="h-10 w-10 rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{b.nameFr}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.category} &bull; {formatDate(b.unlockedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Challenges actifs ({stats.challenges.active.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.challenges.active.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Aucun challenge actif
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.challenges.active.map((ch) => (
                        <div
                          key={ch.challengeId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{ch.templateTitleFr}</p>
                            <p className="text-xs text-muted-foreground">
                              {ch.templateDifficulty} &bull; S{ch.weekNumber}{" "}
                              {ch.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {ch.currentProgress}/{ch.targetValue}
                            </p>
                            <div className="mt-1 h-2 w-24 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(100, (ch.currentProgress / ch.targetValue) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Challenges complétés ({stats.challenges.completed.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.challenges.completed.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Aucun challenge complété
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.challenges.completed.map((ch) => (
                        <div
                          key={ch.challengeId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{ch.templateTitleFr}</p>
                            <p className="text-xs text-muted-foreground">
                              {ch.templateDifficulty} &bull;{" "}
                              {formatDate(ch.completedAt)}
                            </p>
                          </div>
                          {ch.acesAwarded && (
                            <Badge variant="secondary">
                              +{ch.acesAwarded} Aces
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      {user && (
        <>
          <SetPasswordDialog
            user={user}
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          />
          <SetRoleDialog
            user={user}
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
          />
          <BanUserDialog
            user={user}
            open={banDialogOpen}
            onOpenChange={setBanDialogOpen}
          />
          <UnbanUserDialog
            user={user}
            open={unbanDialogOpen}
            onOpenChange={setUnbanDialogOpen}
          />
        </>
      )}
    </div>
  )
}

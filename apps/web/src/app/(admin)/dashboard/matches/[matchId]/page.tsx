"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Trophy, Dumbbell, Clock, Users } from "lucide-react"
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
import { useAdminMatchDetail } from "@/hooks/use-admin-queries"
import { useUpdateMatchDate } from "@/hooks/use-admin-mutations"

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "finished":
      return "default"
    case "ongoing":
      return "secondary"
    case "scheduled":
      return "outline"
    default:
      return "secondary"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "scheduled":
      return "Programmé"
    case "ongoing":
      return "En cours"
    case "finished":
      return "Terminé"
    default:
      return status
  }
}

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string

  const { data, isLoading } = useAdminMatchDetail(matchId)
  const updateDateMutation = useUpdateMatchDate()
  const [editingDate, setEditingDate] = useState(false)
  const [dateValue, setDateValue] = useState("")

  const handleSaveDate = useCallback(() => {
    if (!dateValue) return
    updateDateMutation.mutate(
      { matchId, scheduledAt: new Date(dateValue).toISOString() },
      { onSuccess: () => setEditingDate(false) },
    )
  }, [dateValue, matchId, updateDateMutation])

  const handleStartEdit = useCallback(() => {
    if (data?.match.scheduledAt) {
      setDateValue(toDatetimeLocal(data.match.scheduledAt))
    }
    setEditingDate(true)
  }, [data?.match.scheduledAt])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/matches")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-muted-foreground">Match introuvable</p>
      </div>
    )
  }

  const { match, participants, sets, comments, venueOrganization, participantOrganizations } = data
  const home = participants.find((p) => p.side === "home")
  const away = participants.find((p) => p.side === "away")

  const homeOrg = participantOrganizations.find((po) => po.userId === home?.userId)
  const awayOrg = participantOrganizations.find((po) => po.userId === away?.userId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/matches")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Détail du match</h1>
      </div>

      {/* Match info card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {match.type === "training" ? (
                <Dumbbell className="h-5 w-5 text-orange-500" />
              ) : (
                <Trophy className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-medium">
                {match.type === "training" ? "Entraînement" : "Match"}
              </span>
              <Badge variant={getStatusVariant(match.status)}>
                {getStatusLabel(match.status)}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              ID: {match.id}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Date prévue</p>
              {editingDate ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="datetime-local"
                    className="rounded border px-2 py-1 text-sm"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveDate}
                    disabled={updateDateMutation.isPending}
                  >
                    OK
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDate(false)}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{formatDate(match.scheduledAt)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={handleStartEdit}
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Démarré le</p>
              <p className="text-sm font-medium">{formatDate(match.startedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terminé le</p>
              <p className="text-sm font-medium">{formatDate(match.finishedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="text-sm font-medium">{formatDate(match.createdAt)}</p>
            </div>
          </div>

          {venueOrganization && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Lieu :</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={venueOrganization.logo ?? undefined} />
                <AvatarFallback className="text-[8px]">
                  {getInitials(venueOrganization.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{venueOrganization.name}</span>
              {venueOrganization.address && (
                <span className="text-xs text-muted-foreground">
                  — {venueOrganization.address}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { participant: home, org: homeOrg, label: "Domicile" },
              { participant: away, org: awayOrg, label: "Extérieur" },
            ].map(({ participant, org, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={participant?.user?.image ?? undefined}
                    alt={participant?.user?.name ?? "?"}
                  />
                  <AvatarFallback>
                    {participant?.user?.name
                      ? getInitials(participant.user.name)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {participant?.user?.name ?? "Inconnu"}
                    </span>
                    {participant?.isWinner && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Vainqueur
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {participant?.user?.email}
                  </p>
                  {org && (
                    <p className="text-xs text-muted-foreground">
                      Club : {org.organization.name}
                    </p>
                  )}
                </div>
                <Badge variant="outline">{label}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sets / Scores */}
      {sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Scores par set
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Set</TableHead>
                    <TableHead>{home?.user?.name ?? "Domicile"}</TableHead>
                    <TableHead>{away?.user?.name ?? "Extérieur"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sets.map((s) => {
                    const homeScore = s.scores.find(
                      (sc) => sc.side === "home",
                    )
                    const awayScore = s.scores.find(
                      (sc) => sc.side === "away",
                    )
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          Set {s.setNumber}
                        </TableCell>
                        <TableCell
                          className={
                            (homeScore?.games ?? 0) > (awayScore?.games ?? 0)
                              ? "font-bold"
                              : ""
                          }
                        >
                          {homeScore?.games ?? 0}
                        </TableCell>
                        <TableCell
                          className={
                            (awayScore?.games ?? 0) > (homeScore?.games ?? 0)
                              ? "font-bold"
                              : ""
                          }
                        >
                          {awayScore?.games ?? 0}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Commentaires ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 rounded-lg border p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.user?.name ? getInitials(comment.user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user?.name ?? "Inconnu"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

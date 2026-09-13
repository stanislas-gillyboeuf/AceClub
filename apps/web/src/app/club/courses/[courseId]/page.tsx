"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchClubMembers } from "@/hooks/use-club-court-queries"
import { useCourseDetail } from "@/hooks/use-course-queries"
import {
  useCancelCourseOccurrence,
  useCancelCourseSeries,
  useEnrollCourseMember,
  useUnenrollCourseMember,
  useUpdateCourse,
} from "@/hooks/use-course-mutations"

const WEEKDAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ClubCourseDetailPage() {
  const router = useRouter()
  const params = useParams<{ courseId: string }>()
  const { data, isLoading } = useCourseDetail(params.courseId)
  const updateCourse = useUpdateCourse()
  const cancelSeries = useCancelCourseSeries()
  const cancelOccurrence = useCancelCourseOccurrence()
  const enrollMember = useEnrollCourseMember()
  const unenrollMember = useUnenrollCourseMember()

  const [rosterSearch, setRosterSearch] = useState("")
  const { data: searchResults } = useSearchClubMembers(data?.course.organizationId ?? "", rosterSearch)

  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (data) setEndDate(data.course.endDate.slice(0, 10))
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const { course, roster, occurrences } = data
  const now = Date.now()
  const upcoming = occurrences.filter((o) => new Date(o.startAt).getTime() >= now)
  const past = occurrences.filter((o) => new Date(o.startAt).getTime() < now)
  const rosterIds = new Set(roster.map((r) => r.userId))

  function handleCancelOccurrence(bookingId: string, reopen: boolean) {
    cancelOccurrence.mutate({ bookingId, reopen })
  }

  function handleExtendEndDate() {
    if (!endDate) return
    updateCourse.mutate({ courseId: course.id, endDate })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/courses")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux cours
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-sm text-muted-foreground">
            {course.coachName} · {course.courtName} · {WEEKDAY_LABELS[course.weekday]} {course.startTime}{" "}
            ({course.durationMinutes} min)
          </p>
        </div>
        <Badge variant={course.status === "active" ? "default" : "secondary"}>
          {course.status === "active" ? "Actif" : "Annulé"}
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Roster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun membre inscrit.</p>
            ) : (
              <ul className="space-y-2">
                {roster.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.name}</span>
                    </div>
                    {course.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={unenrollMember.isPending}
                        onClick={() => unenrollMember.mutate({ courseId: course.id, userId: m.userId })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {course.status === "active" ? (
              <div className="space-y-1.5 pt-2">
                <Input
                  placeholder="Ajouter un membre..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                />
                {searchResults?.length ? (
                  <div className="max-h-32 space-y-1 overflow-auto rounded-md border p-1">
                    {searchResults
                      .filter((r) => !rosterIds.has(r.userId))
                      .map((m) => (
                        <button
                          key={m.userId}
                          type="button"
                          disabled={enrollMember.isPending}
                          onClick={() => {
                            enrollMember.mutate({ courseId: course.id, userId: m.userId })
                            setRosterSearch("")
                          }}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                          </Avatar>
                          {m.name}
                        </button>
                      ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Série</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.status === "active" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date">Prolonger / raccourcir jusqu&apos;au</Label>
                  <div className="flex gap-2">
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleExtendEndDate} disabled={updateCourse.isPending}>
                      {updateCourse.isPending ? "..." : "Appliquer"}
                    </Button>
                  </div>
                  {updateCourse.isError ? (
                    <p className="text-sm text-destructive">{updateCourse.error.message}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Ne modifie que les séances futures — l&apos;historique est conservé.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={cancelSeries.isPending}
                  onClick={() => cancelSeries.mutate(course.id)}
                >
                  {cancelSeries.isPending ? "Annulation..." : "Annuler toute la série"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Cette série a été annulée.</p>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Séances à venir</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune séance à venir.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((o) => (
                  <li key={o.id} className="flex items-center justify-between text-sm">
                    <span className={o.status === "cancelled" ? "text-muted-foreground line-through" : ""}>
                      {formatDateTime(o.startAt)}
                    </span>
                    {o.status === "confirmed" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancelOccurrence.isPending}
                          onClick={() => handleCancelOccurrence(o.id, true)}
                        >
                          Annuler et libérer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancelOccurrence.isPending}
                          onClick={() => handleCancelOccurrence(o.id, false)}
                        >
                          Annuler et bloquer
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary">Annulée</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune séance passée.</p>
            ) : (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {past.map((o) => (
                  <li key={o.id} className="flex items-center justify-between">
                    <span>{formatDateTime(o.startAt)}</span>
                    {o.status === "cancelled" ? <Badge variant="secondary">Annulée</Badge> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

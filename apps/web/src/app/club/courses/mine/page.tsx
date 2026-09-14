"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AttendanceDialog } from "@/components/custom/attendance-dialog"
import { NotifyStudentsDialog } from "@/components/custom/notify-students-dialog"
import { useMyCourses } from "@/hooks/use-course-queries"
import { useCancelCourseOccurrence } from "@/hooks/use-course-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { CourseRosterMember } from "@/types/course"

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

export default function CoachMyCoursesPage() {
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useMyCourses(organizationId)
  const cancelOccurrence = useCancelCourseOccurrence()

  const [attendanceTarget, setAttendanceTarget] = useState<{ bookingId: string; courseName: string } | null>(
    null,
  )
  const [notifyTarget, setNotifyTarget] = useState<{
    courseId: string
    courseName: string
    roster: CourseRosterMember[]
  } | null>(null)

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Mes cours</h1>

      {data.courses.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucun cours ne vous est assigné pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {data.courses.map((course) => {
            const now = Date.now()
            const upcoming = course.occurrences.filter(
              (o) => new Date(o.startAt).getTime() >= now && o.status === "confirmed",
            )
            const past = course.occurrences.filter((o) => new Date(o.startAt).getTime() < now)

            return (
              <Card key={course.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.courtName} · {WEEKDAY_LABELS[course.weekday]} {course.startTime} (
                      {course.durationMinutes} min)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNotifyTarget({ courseId: course.id, courseName: course.name, roster: course.roster })
                      }
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifier
                    </Button>
                    <Badge variant={course.status === "active" ? "default" : "secondary"}>
                      {course.status === "active" ? "Actif" : "Annulé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Roster ({course.roster.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {course.roster.map((m) => (
                        <div key={m.userId} className="flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{m.name}</span>
                        </div>
                      ))}
                      {course.roster.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun membre inscrit.</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Prochaines séances</p>
                    {upcoming.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune séance à venir.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {upcoming.map((o) => (
                          <li key={o.id} className="flex items-center justify-between text-sm">
                            <span>{formatDateTime(o.startAt)}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAttendanceTarget({ bookingId: o.id, courseName: course.name })}
                              >
                                Présences
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancelOccurrence.isPending}
                                onClick={() =>
                                  cancelOccurrence.mutate({ bookingId: o.id, reopen: false })
                                }
                              >
                                Annuler cette séance
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {past.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium">Historique</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {past.slice(0, 10).map((o) => (
                          <li key={o.id} className="flex items-center justify-between">
                            <span>{formatDateTime(o.startAt)}</span>
                            {o.status === "cancelled" ? (
                              <Badge variant="secondary">Annulée</Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAttendanceTarget({ bookingId: o.id, courseName: course.name })}
                              >
                                Présences
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AttendanceDialog
        bookingId={attendanceTarget?.bookingId ?? null}
        courseName={attendanceTarget?.courseName ?? ""}
        onOpenChange={(open) => {
          if (!open) setAttendanceTarget(null)
        }}
      />

      <NotifyStudentsDialog
        courseId={notifyTarget?.courseId ?? null}
        courseName={notifyTarget?.courseName ?? ""}
        roster={notifyTarget?.roster ?? []}
        onOpenChange={(open) => {
          if (!open) setNotifyTarget(null)
        }}
      />
    </div>
  )
}

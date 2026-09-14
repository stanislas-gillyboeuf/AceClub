"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseFormDialog } from "@/components/custom/course-actions"
import { useCourses } from "@/hooks/use-course-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"

const WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

export default function ClubCoursesPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useCourses(organizationId)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null)

  const coaches = useMemo(() => {
    const byId = new Map<string, { userId: string; name: string; image: string | null; count: number }>()
    for (const c of data?.courses ?? []) {
      const existing = byId.get(c.coachUserId)
      if (existing) existing.count++
      else byId.set(c.coachUserId, { userId: c.coachUserId, name: c.coachName, image: c.coachImage, count: 1 })
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const filteredCourses = useMemo(() => {
    const courses = data?.courses ?? []
    return selectedCoachId ? courses.filter((c) => c.coachUserId === selectedCoachId) : courses
  }, [data, selectedCoachId])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cours</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau cours
        </Button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Profs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedCoachId(null)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    selectedCoachId === null ? "bg-accent font-medium" : "hover:bg-accent/50"
                  }`}
                >
                  Tous
                  <span className="text-xs text-muted-foreground">{data?.courses.length ?? 0}</span>
                </button>
                {coaches.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">Aucun coach assigné.</p>
                ) : (
                  coaches.map((coach) => (
                    <button
                      key={coach.userId}
                      type="button"
                      onClick={() => setSelectedCoachId(coach.userId)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        selectedCoachId === coach.userId ? "bg-accent font-medium" : "hover:bg-accent/50"
                      }`}
                    >
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={coach.image ?? undefined} alt={coach.name} />
                        <AvatarFallback className="text-[10px]">{initials(coach.name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate">{coach.name}</span>
                      <span className="text-xs text-muted-foreground">{coach.count}</span>
                    </button>
                  ))
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {selectedCoachId ? "Aucun cours pour ce coach." : "Aucun cours pour le moment."}
              </CardContent>
            </Card>
          ) : (
            filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => router.push(`/club/courses/${course.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.coachName} · {course.courtName} · {WEEKDAY_LABELS[course.weekday]}{" "}
                      {course.startTime} ({course.durationMinutes} min)
                    </p>
                  </div>
                  <Badge variant={course.status === "active" ? "default" : "secondary"}>
                    {course.status === "active" ? "Actif" : "Annulé"}
                  </Badge>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      <CourseFormDialog organizationId={organizationId} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

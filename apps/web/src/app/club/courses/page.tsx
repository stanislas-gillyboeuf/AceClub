"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseFormDialog } from "@/components/custom/course-actions"
import { useCourses } from "@/hooks/use-course-queries"
import { useClubAdminContext } from "@/lib/club-admin-context"

const WEEKDAY_LABELS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

export default function ClubCoursesPage() {
  const router = useRouter()
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useCourses(organizationId)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cours</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau cours
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : !data?.courses.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucun cours pour le moment.
            </CardContent>
          </Card>
        ) : (
          data.courses.map((course) => (
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

      <CourseFormDialog organizationId={organizationId} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOccurrenceAttendance } from "@/hooks/use-course-queries"
import { useMarkAttendance } from "@/hooks/use-course-mutations"
import type { AttendanceStatus } from "@/types/course"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

interface AttendanceDialogProps {
  bookingId: string | null
  courseName: string
  onOpenChange: (open: boolean) => void
}

export function AttendanceDialog({ bookingId, courseName, onOpenChange }: AttendanceDialogProps) {
  const { data, isLoading } = useOccurrenceAttendance(bookingId)
  const markAttendance = useMarkAttendance()

  function handleSet(userId: string, status: AttendanceStatus) {
    if (!bookingId) return
    markAttendance.mutate({ bookingId, userId, status })
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Présences — {courseName}</DialogTitle>
          <DialogDescription>
            {data ? new Date(data.startAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !data?.roster.length ? (
            <p className="text-sm text-muted-foreground">Aucun membre inscrit à ce cours.</p>
          ) : (
            data.roster.map((m) => (
              <div key={m.userId} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={m.image ?? undefined} alt={m.name} />
                    <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 truncate text-sm">{m.name}</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant={m.status === "present" ? "default" : "outline"}
                    disabled={markAttendance.isPending}
                    onClick={() => handleSet(m.userId, "present")}
                  >
                    Présent
                  </Button>
                  <Button
                    size="sm"
                    variant={m.status === "absent" ? "destructive" : "outline"}
                    disabled={markAttendance.isPending}
                    onClick={() => handleSet(m.userId, "absent")}
                  >
                    Absent
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

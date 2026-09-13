"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useClubCourts, useSearchClubMembers } from "@/hooks/use-club-court-queries"
import { useCreateCourse } from "@/hooks/use-course-mutations"

const WEEKDAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const DURATIONS = [30, 45, 60, 90, 120]

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** First date >= startDate matching `weekday`, as "YYYY-MM-DD" (mirrors the backend's
 * occurrence generator so the session count preview is accurate). */
function firstOccurrenceDate(startDate: string, weekday: number): string {
  const d = new Date(`${startDate}T00:00:00Z`)
  const diff = (weekday - d.getUTCDay() + 7) % 7
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

interface CourseFormDialogProps {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CourseFormDialog({ organizationId, open, onOpenChange }: CourseFormDialogProps) {
  const { data: courts } = useClubCourts(organizationId)
  const createCourse = useCreateCourse()

  const [name, setName] = useState("")
  const [courtId, setCourtId] = useState("")
  const [weekday, setWeekday] = useState(1)
  const [startTime, setStartTime] = useState("18:00")
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [startDate, setStartDate] = useState(todayISO)
  const [endMode, setEndMode] = useState<"date" | "count">("count")
  const [endDate, setEndDate] = useState("")
  const [sessionCount, setSessionCount] = useState("12")

  const [coachSearch, setCoachSearch] = useState("")
  const [coach, setCoach] = useState<{ userId: string; name: string } | null>(null)
  const { data: coachResults } = useSearchClubMembers(organizationId, coachSearch)

  useEffect(() => {
    if (!open) {
      setName("")
      setCourtId("")
      setCoach(null)
      setCoachSearch("")
    }
  }, [open])

  const resolvedEndDate =
    endMode === "count"
      ? addDays(firstOccurrenceDate(startDate, weekday), (Number(sessionCount) - 1) * 7)
      : endDate

  const isValid =
    name.trim().length > 0 &&
    !!courtId &&
    !!coach &&
    !!startDate &&
    !!resolvedEndDate &&
    resolvedEndDate >= startDate &&
    (endMode === "date" || Number(sessionCount) > 0)

  function handleSubmit() {
    if (!isValid || !coach) return
    createCourse.mutate(
      {
        organizationId,
        coachUserId: coach.userId,
        courtId,
        name: name.trim(),
        weekday,
        startTime,
        durationMinutes,
        startDate,
        endDate: resolvedEndDate,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau cours</DialogTitle>
          <DialogDescription>
            Les séances sont générées immédiatement pour toute la période — chacune reste
            annulable individuellement ensuite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="course-name">Nom du cours</Label>
            <Input
              id="course-name"
              placeholder="Cours enfants"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Coach</Label>
            {coach ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium">{coach.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setCoach(null)}>
                  Changer
                </Button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Rechercher un membre..."
                  value={coachSearch}
                  onChange={(e) => setCoachSearch(e.target.value)}
                />
                {coachResults?.length ? (
                  <div className="max-h-40 space-y-1 overflow-auto rounded-md border p-1">
                    {coachResults.map((m) => (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => setCoach({ userId: m.userId, name: m.name })}
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
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Court</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un court" />
              </SelectTrigger>
              <SelectContent>
                {courts?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Jour</Label>
              <Select value={String(weekday)} onValueChange={(v) => setWeekday(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAY_LABELS.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-start-time">Heure</Label>
              <Input
                id="course-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Durée</Label>
              <Select
                value={String(durationMinutes)}
                onValueChange={(v) => setDurationMinutes(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-start-date">Date de début</Label>
              <Input
                id="course-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fin de la période</Label>
              <Select value={endMode} onValueChange={(v: "date" | "count") => setEndMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Nombre de séances</SelectItem>
                  <SelectItem value="date">Date de fin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {endMode === "count" ? (
            <div className="space-y-1.5">
              <Label htmlFor="session-count">Nombre de séances</Label>
              <Input
                id="session-count"
                type="number"
                min={1}
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="course-end-date">Date de fin</Label>
              <Input
                id="course-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {resolvedEndDate ? (
            <p className="text-xs text-muted-foreground">
              Dernière séance prévue le {resolvedEndDate}.
            </p>
          ) : null}
        </div>

        {createCourse.isError ? (
          <p className="text-sm text-destructive">{createCourse.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createCourse.isPending}>
            {createCourse.isPending ? "Création..." : "Créer le cours"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotifyStudents } from "@/hooks/use-course-mutations"
import type { CourseRosterMember } from "@/types/course"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

interface NotifyStudentsDialogProps {
  courseId: string | null
  courseName: string
  roster: CourseRosterMember[]
  onOpenChange: (open: boolean) => void
}

export function NotifyStudentsDialog({
  courseId,
  courseName,
  roster,
  onOpenChange,
}: NotifyStudentsDialogProps) {
  const notifyStudents = useNotifyStudents()
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (courseId) setSelected(roster.map((m) => m.userId))
  }, [courseId, roster])

  function toggle(userId: string) {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  function handleSend() {
    if (!courseId || selected.length === 0 || !message.trim()) return
    notifyStudents.mutate(
      { courseId, userIds: selected, body: message.trim(), title: courseName },
      {
        onSuccess: () => {
          onOpenChange(false)
          setMessage("")
        },
      },
    )
  }

  const isValid = selected.length > 0 && message.trim().length > 0

  return (
    <Dialog open={!!courseId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifier les élèves — {courseName}</DialogTitle>
          <DialogDescription>Envoie une notification push aux élèves sélectionnés.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun membre inscrit à ce cours.</p>
            ) : (
              roster.map((m) => (
                <label key={m.userId} className="flex items-center gap-2.5 rounded-md px-1 py-1 text-sm">
                  <Checkbox checked={selected.includes(m.userId)} onCheckedChange={() => toggle(m.userId)} />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={m.image ?? undefined} alt={m.name} />
                    <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  {m.name}
                </label>
              ))
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notify-message">Message</Label>
            <Textarea
              id="notify-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Ex : Cours annulé demain, on se rattrape la semaine prochaine."
            />
          </div>
        </div>

        {notifyStudents.isError ? (
          <p className="text-sm text-destructive">{notifyStudents.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={!isValid || notifyStudents.isPending}>
            {notifyStudents.isPending ? "Envoi..." : `Envoyer (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

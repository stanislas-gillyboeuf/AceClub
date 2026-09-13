"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClubCourts } from "@/hooks/use-club-court-queries"
import { useBookForClub } from "@/hooks/use-club-court-mutations"
import type { BlockReason } from "@/types/court"

const REASON_LABELS: Record<BlockReason, string> = {
  maintenance: "Maintenance",
  club_event: "Événement club",
  private_rental: "Location privée",
  other: "Autre",
}

interface AdminBlockDialogProps {
  organizationId: string
  defaultDate: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function AdminBlockDialog({ organizationId, defaultDate, open, onOpenChange }: AdminBlockDialogProps) {
  const { data: courts } = useClubCourts(organizationId)
  const bookForClub = useBookForClub()

  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([])
  const [date, setDate] = useState(defaultDate || todayISO())
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("18:00")
  const [reason, setReason] = useState<BlockReason>("maintenance")
  const [detail, setDetail] = useState("")
  const [results, setResults] = useState<{ courtName: string; ok: boolean; message?: string }[] | null>(
    null,
  )

  const isValid =
    selectedCourtIds.length > 0 &&
    !!date &&
    !!startTime &&
    !!endTime &&
    startTime < endTime &&
    (reason !== "other" || detail.trim().length > 0)

  function toggleCourt(courtId: string) {
    setSelectedCourtIds((prev) =>
      prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId],
    )
  }

  async function handleSubmit() {
    if (!isValid) return
    const startAt = new Date(`${date}T${startTime}:00`).toISOString()
    const endAt = new Date(`${date}T${endTime}:00`).toISOString()

    const outcomes = await Promise.all(
      selectedCourtIds.map(async (courtId) => {
        const court = courts?.find((c) => c.id === courtId)
        try {
          await bookForClub.mutateAsync({
            courtId,
            startAt,
            endAt,
            blockReason: reason,
            blockReasonDetail: reason === "other" ? detail.trim() : undefined,
          })
          return { courtName: court?.name ?? courtId, ok: true }
        } catch (error) {
          return { courtName: court?.name ?? courtId, ok: false, message: (error as Error).message }
        }
      }),
    )

    setResults(outcomes)
    if (outcomes.every((o) => o.ok)) {
      onOpenChange(false)
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedCourtIds([])
      setDetail("")
      setResults(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bloquer un créneau</DialogTitle>
          <DialogDescription>
            Plage horaire libre, sur un ou plusieurs courts — les membres verront ce créneau comme
            indisponible, sans le motif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Courts</Label>
            <div className="grid grid-cols-2 gap-2">
              {courts?.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Checkbox
                    checked={selectedCourtIds.includes(c.id)}
                    onCheckedChange={() => toggleCourt(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="block-date">Date</Label>
              <Input id="block-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-start">Début</Label>
              <Input
                id="block-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-end">Fin</Label>
              <Input id="block-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Motif</Label>
            <Select value={reason} onValueChange={(v: BlockReason) => setReason(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REASON_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === "other" ? (
            <div className="space-y-1.5">
              <Label htmlFor="block-detail">Précision</Label>
              <Input
                id="block-detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Détail du motif"
              />
            </div>
          ) : null}

          {results ? (
            <ul className="space-y-1 text-sm">
              {results.map((r, i) => (
                <li key={i} className={r.ok ? "text-emerald-600" : "text-destructive"}>
                  {r.courtName} — {r.ok ? "bloqué" : r.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || bookForClub.isPending}>
            {bookForClub.isPending ? "Blocage..." : "Bloquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

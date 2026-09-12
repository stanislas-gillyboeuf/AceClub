"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSearchClubMembers } from "@/hooks/use-club-court-queries"
import { useBookForClub, useCancelClubBooking } from "@/hooks/use-club-court-mutations"
import type { AdminBoardCourt, AdminBoardHourCell } from "@/types/court"

interface BookingCellDialogProps {
  organizationId: string
  date: string
  court: AdminBoardCourt | null
  cell: AdminBoardHourCell | null
  onOpenChange: (open: boolean) => void
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function slotBounds(date: string, hour: number, slotDurationMinutes: number) {
  const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`)
  const end = new Date(start.getTime() + slotDurationMinutes * 60 * 1000)
  return { startAt: start.toISOString(), endAt: end.toISOString() }
}

export function BookingCellDialog({
  organizationId,
  date,
  court,
  cell,
  onOpenChange,
}: BookingCellDialogProps) {
  const [search, setSearch] = useState("")
  const { data: members } = useSearchClubMembers(organizationId, search)
  const bookForClub = useBookForClub()
  const cancelBooking = useCancelClubBooking()

  const open = !!court && !!cell
  const isFree = cell?.status === "free"

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) setSearch("")
    onOpenChange(nextOpen)
  }

  function handlePickMember(userId: string) {
    if (!court || !cell) return
    const { startAt, endAt } = slotBounds(date, cell.hour, court.slotDurationMinutes)
    bookForClub.mutate(
      { courtId: court.id, startAt, endAt, userId },
      { onSuccess: () => handleClose(false) },
    )
  }

  function handleCancel() {
    if (!cell?.bookingId) return
    cancelBooking.mutate(
      { bookingId: cell.bookingId, override: true },
      { onSuccess: () => handleClose(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {isFree ? (
          <>
            <DialogHeader>
              <DialogTitle>
                Réserver {court?.name} — {cell?.hour}h
              </DialogTitle>
              <DialogDescription>Recherchez un membre pour réserver ce créneau.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="Nom du membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-64 space-y-1 overflow-auto">
              {members?.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  disabled={bookForClub.isPending}
                  onClick={() => handlePickMember(member.userId)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                </button>
              ))}
              {search && !members?.length ? (
                <p className="px-2 py-2 text-sm text-muted-foreground">Aucun membre trouvé.</p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {court?.name} — {cell?.hour}h
              </DialogTitle>
              <DialogDescription>
                {cell?.bookedAsClub ? "Créneau réservé par le club" : `Réservé par ${cell?.bookedByName}`}
                {cell?.purpose ? ` · ${cell.purpose}` : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between">
              {cell?.bookedByUserId ? (
                <Button variant="outline" asChild>
                  <Link href={`/club/members/${cell.bookedByUserId}`}>Voir le membre</Link>
                </Button>
              ) : (
                <span />
              )}
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
              >
                {cancelBooking.isPending ? "Annulation..." : "Annuler la réservation"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

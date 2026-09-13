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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSearchClubMembers } from "@/hooks/use-club-court-queries"
import { useSuggestSlot } from "@/hooks/use-club-court-mutations"
import type { SlotToFill } from "@/types/club-dashboard"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

interface SuggestSlotDialogProps {
  organizationId: string
  slot: SlotToFill | null
  onOpenChange: (open: boolean) => void
}

export function SuggestSlotDialog({ organizationId, slot, onOpenChange }: SuggestSlotDialogProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{ userId: string; name: string }[]>([])
  const { data: results } = useSearchClubMembers(organizationId, search)
  const suggestSlot = useSuggestSlot()

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setSearch("")
      setSelected([])
    }
    onOpenChange(nextOpen)
  }

  function toggle(member: { userId: string; name: string }) {
    setSelected((prev) =>
      prev.some((m) => m.userId === member.userId)
        ? prev.filter((m) => m.userId !== member.userId)
        : [...prev, member],
    )
  }

  function handleSend() {
    if (!slot || selected.length === 0) return
    suggestSlot.mutate(
      {
        organizationId,
        courtId: slot.courtId,
        date: slot.date,
        hour: slot.hour,
        userIds: selected.map((m) => m.userId),
      },
      { onSuccess: () => handleClose(false) },
    )
  }

  return (
    <Dialog open={!!slot} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Suggérer {slot?.courtName} — {slot?.hour}h
          </DialogTitle>
          <DialogDescription>
            Les membres sélectionnés recevront une notification pour ce créneau libre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selected.map((m) => (
                <Badge key={m.userId} variant="secondary" className="cursor-pointer" onClick={() => toggle(m)}>
                  {m.name} ×
                </Badge>
              ))}
            </div>
          ) : null}

          <Input
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-56 space-y-1 overflow-auto">
            {results
              ?.filter((m) => !selected.some((s) => s.userId === m.userId))
              .map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggle({ userId: m.userId, name: m.name })}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  {m.name}
                </button>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={selected.length === 0 || suggestSlot.isPending}>
            {suggestSlot.isPending ? "Envoi..." : `Envoyer (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

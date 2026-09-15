"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useSearchClubMembers } from "@/hooks/use-club-court-queries"
import { useAddEventParticipant } from "@/hooks/use-event-mutations"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

interface AddEventParticipantProps {
  eventId: string
  organizationId: string
  existingUserIds: Set<string>
}

export function AddEventParticipant({
  eventId,
  organizationId,
  existingUserIds,
}: AddEventParticipantProps) {
  const [search, setSearch] = useState("")
  const { data: results } = useSearchClubMembers(organizationId, search)
  const addParticipant = useAddEventParticipant()

  return (
    <div className="space-y-1.5">
      <Input
        placeholder="Inscrire un membre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {addParticipant.isError ? (
        <p className="text-sm text-destructive">{addParticipant.error.message}</p>
      ) : null}
      {results?.length ? (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-1">
          {results
            .filter((m) => !existingUserIds.has(m.userId))
            .map((m) => (
              <button
                key={m.userId}
                type="button"
                disabled={addParticipant.isPending}
                onClick={() => {
                  addParticipant.mutate({ eventId, userId: m.userId })
                  setSearch("")
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                </Avatar>
                <span className="flex-1">{m.name}</span>
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
        </div>
      ) : null}
    </div>
  )
}

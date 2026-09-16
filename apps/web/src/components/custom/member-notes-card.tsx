"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useMemberNotes } from "@/hooks/use-club-member-queries"
import { useAddMemberNote } from "@/hooks/use-club-member-mutations"

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface MemberNotesCardProps {
  organizationId: string
  userId: string
}

export function MemberNotesCard({ organizationId, userId }: MemberNotesCardProps) {
  const { data: notes, isLoading } = useMemberNotes(organizationId, userId)
  const addNote = useAddMemberNote()
  const [draft, setDraft] = useState("")

  function handleSubmit() {
    if (!draft.trim()) return
    addNote.mutate(
      { organizationId, userId, body: draft.trim() },
      { onSuccess: () => setDraft("") },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes internes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : !notes?.length ? (
          <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md border p-3 text-sm">
                <p className="whitespace-pre-wrap">{note.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {note.authorName} · {formatDateTime(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ajouter une note..."
            rows={3}
          />
          {addNote.isError ? (
            <p className="text-sm text-destructive">{addNote.error.message}</p>
          ) : null}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!draft.trim() || addNote.isPending}
          >
            {addNote.isPending ? "Ajout..." : "Ajouter une note"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

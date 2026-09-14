"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RecordWinnerDialog } from "@/components/custom/record-winner-dialog"
import { useResetMatch } from "@/hooks/use-tournament-mutations"
import { totalRoundsFor } from "@/lib/tournament"
import type { TournamentMatchRow } from "@/types/tournament"

function roundLabel(round: number, rounds: number): string {
  const fromEnd = rounds - round
  if (fromEnd === 0) return "Finale"
  if (fromEnd === 1) return "Demi-finales"
  if (fromEnd === 2) return "Quarts de finale"
  return `Tour ${round}`
}

function MatchCard({
  match,
  onSelect,
  onResetRequest,
}: {
  match: TournamentMatchRow
  onSelect: (match: TournamentMatchRow) => void
  onResetRequest: (match: TournamentMatchRow) => void
}) {
  const isReady = match.status === "ready"

  return (
    <div
      className={cn(
        "w-56 rounded-lg border bg-card p-2.5 text-sm",
        isReady && "cursor-pointer transition-colors hover:bg-accent/50",
      )}
      onClick={() => isReady && onSelect(match)}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded px-1.5 py-1",
          match.winnerUserId && match.winnerUserId === match.player1UserId && "bg-emerald-100 font-medium",
        )}
      >
        <span className="truncate">{match.player1Name ?? "—"}</span>
      </div>
      <div
        className={cn(
          "flex items-center justify-between rounded px-1.5 py-1",
          match.winnerUserId && match.winnerUserId === match.player2UserId && "bg-emerald-100 font-medium",
        )}
      >
        <span className="truncate">
          {match.status === "bye" ? "Exempt" : (match.player2Name ?? "—")}
        </span>
      </div>
      {match.status === "completed" ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-6 w-full text-xs text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onResetRequest(match)
          }}
        >
          Réinitialiser
        </Button>
      ) : null}
    </div>
  )
}

export function TournamentBracket({
  drawSize,
  matches,
}: {
  drawSize: number
  matches: TournamentMatchRow[]
}) {
  const rounds = totalRoundsFor(drawSize)
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatchRow | null>(null)
  const [resetTarget, setResetTarget] = useState<TournamentMatchRow | null>(null)
  const resetMatch = useResetMatch()

  const matchesByRound = new Map<number, TournamentMatchRow[]>()
  for (const m of matches) {
    const list = matchesByRound.get(m.round) ?? []
    list.push(m)
    matchesByRound.set(m.round, list)
  }
  for (const list of matchesByRound.values()) list.sort((a, b) => a.position - b.position)

  const finalMatch = matchesByRound.get(rounds)?.[0]

  return (
    <div>
      {finalMatch?.status === "completed" && finalMatch.winnerName ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <Trophy className="h-5 w-5" />
          <span className="font-medium">Champion : {finalMatch.winnerName}</span>
        </div>
      ) : null}

      <div className="flex gap-6 overflow-x-auto pb-4">
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex shrink-0 flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {roundLabel(round, rounds)}
            </p>
            <div
              className="flex flex-col justify-around gap-4"
              style={{ minHeight: `${(drawSize / 2 ** round) * 70}px` }}
            >
              {(matchesByRound.get(round) ?? []).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={setSelectedMatch}
                  onResetRequest={setResetTarget}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <RecordWinnerDialog
        match={selectedMatch}
        onOpenChange={(open) => {
          if (!open) setSelectedMatch(null)
        }}
      />

      <AlertDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser ce match ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le résultat sera effacé. Si le tour suivant a déjà un résultat basé dessus, il faudra
              d&apos;abord le réinitialiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {resetMatch.isError ? (
            <p className="text-sm text-destructive">{resetMatch.error.message}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resetTarget) resetMatch.mutate(resetTarget.id, { onSuccess: () => setResetTarget(null) })
              }}
              disabled={resetMatch.isPending}
            >
              {resetMatch.isPending ? "..." : "Réinitialiser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

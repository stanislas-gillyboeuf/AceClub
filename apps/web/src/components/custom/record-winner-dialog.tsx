"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRecordMatchWinner } from "@/hooks/use-tournament-mutations"
import type { TournamentMatchRow } from "@/types/tournament"

interface RecordWinnerDialogProps {
  match: TournamentMatchRow | null
  onOpenChange: (open: boolean) => void
}

export function RecordWinnerDialog({ match, onOpenChange }: RecordWinnerDialogProps) {
  const recordWinner = useRecordMatchWinner()

  function handlePick(winnerUserId: string) {
    if (!match) return
    recordWinner.mutate(
      { tournamentMatchId: match.id, winnerUserId },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={!!match} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Résultat du match</DialogTitle>
          <DialogDescription>Qui a gagné ?</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16"
            disabled={recordWinner.isPending || !match?.player1UserId}
            onClick={() => match?.player1UserId && handlePick(match.player1UserId)}
          >
            {match?.player1Name}
          </Button>
          <Button
            variant="outline"
            className="h-16"
            disabled={recordWinner.isPending || !match?.player2UserId}
            onClick={() => match?.player2UserId && handlePick(match.player2UserId)}
          >
            {match?.player2Name}
          </Button>
        </div>
        {recordWinner.isError ? (
          <p className="text-sm text-destructive">{recordWinner.error.message}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

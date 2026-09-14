"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TournamentSeedPanel } from "@/components/custom/tournament-seed-panel"
import { TournamentBracket } from "@/components/custom/tournament-bracket"
import { useTournamentDetail } from "@/hooks/use-tournament-queries"
import { useDeleteTournament } from "@/hooks/use-tournament-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

const STATUS_LABELS: Record<string, string> = {
  draft: "En préparation",
  in_progress: "En cours",
  completed: "Terminé",
}

const SPORT_LABELS: Record<string, string> = { tennis: "Tennis", padel: "Padel" }

export default function ClubTournamentDetailPage() {
  const router = useRouter()
  const params = useParams<{ tournamentId: string }>()
  const { organizationId } = useClubAdminContext()
  const { data, isLoading } = useTournamentDetail(params.tournamentId)
  const deleteTournament = useDeleteTournament()

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href={`/club/events/${data.eventId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;événement
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.eventName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {SPORT_LABELS[data.sport]} · Tableau de {data.drawSize}
          </p>
        </div>
        <Badge variant={data.status === "completed" ? "default" : "secondary"}>
          {STATUS_LABELS[data.status]}
        </Badge>
      </div>

      <div className="mt-6">
        {data.status === "draft" ? (
          <TournamentSeedPanel
            tournamentId={data.id}
            organizationId={organizationId}
            drawSize={data.drawSize}
            seeds={data.seeds}
          />
        ) : (
          <TournamentBracket drawSize={data.drawSize} matches={data.matches} />
        )}
      </div>

      {data.status === "draft" ? (
        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Supprimer le tournoi</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce tournoi ?</AlertDialogTitle>
                <AlertDialogDescription>
                  L&apos;événement et ses inscriptions restent intacts — seul le tournoi (et les
                  joueurs déjà seedés) est supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteTournament.mutate(data.id, {
                      onSuccess: () => router.push(`/club/events/${data.eventId}`),
                    })
                  }
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </div>
  )
}

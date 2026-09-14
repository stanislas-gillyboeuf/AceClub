"use client"

import { useState } from "react"
import { ArrowDownAZ, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSearchClubMembers } from "@/hooks/use-club-court-queries"
import {
  useAddSeed,
  useAutoSeed,
  useGenerateBracket,
  useRemoveSeed,
  useUpdateSeedNumber,
} from "@/hooks/use-tournament-mutations"
import type { TournamentSeedRow } from "@/types/tournament"

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

interface TournamentSeedPanelProps {
  tournamentId: string
  organizationId: string
  drawSize: number
  seeds: TournamentSeedRow[]
}

export function TournamentSeedPanel({
  tournamentId,
  organizationId,
  drawSize,
  seeds,
}: TournamentSeedPanelProps) {
  const [search, setSearch] = useState("")
  const { data: results } = useSearchClubMembers(organizationId, search)
  const addSeed = useAddSeed()
  const removeSeed = useRemoveSeed()
  const autoSeed = useAutoSeed()
  const updateSeedNumber = useUpdateSeedNumber()
  const generateBracket = useGenerateBracket()

  const seededUserIds = new Set(seeds.map((s) => s.userId))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Joueurs seedés ({seeds.length}/{drawSize})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            disabled={autoSeed.isPending || seeds.length === 0}
            onClick={() => autoSeed.mutate(tournamentId)}
          >
            <ArrowDownAZ className="mr-2 h-4 w-4" />
            Trier par niveau
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {seeds.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun joueur pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {[...seeds]
                .sort((a, b) => a.seedNumber - b.seedNumber)
                .map((seed) => (
                  <li key={seed.userId} className="flex items-center gap-3 rounded-md border px-3 py-2">
                    <Input
                      type="number"
                      min={1}
                      value={seed.seedNumber}
                      className="w-16"
                      disabled={updateSeedNumber.isPending}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0) {
                          updateSeedNumber.mutate({ tournamentId, userId: seed.userId, seedNumber: value })
                        }
                      }}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={seed.image ?? undefined} alt={seed.name} />
                      <AvatarFallback className="text-xs">{initials(seed.name)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium">{seed.name}</span>
                    {seed.skillLevel ? <Badge variant="outline">{seed.skillLevel}</Badge> : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removeSeed.isPending}
                      onClick={() => removeSeed.mutate({ tournamentId, userId: seed.userId })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          )}

          <div className="space-y-1.5">
            <Input
              placeholder="Rechercher un membre à ajouter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {results?.length ? (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-1">
                {results
                  .filter((m) => !seededUserIds.has(m.userId))
                  .map((m) => (
                    <button
                      key={m.userId}
                      type="button"
                      disabled={addSeed.isPending}
                      onClick={() => {
                        addSeed.mutate({ tournamentId, userId: m.userId })
                        setSearch("")
                      }}
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
          </div>
        </CardContent>
      </Card>

      {generateBracket.isError ? (
        <p className="text-sm text-destructive">{generateBracket.error.message}</p>
      ) : null}

      <Button
        className="w-full"
        disabled={seeds.length < 2 || seeds.length > drawSize || generateBracket.isPending}
        onClick={() => generateBracket.mutate(tournamentId)}
      >
        {generateBracket.isPending ? "Génération..." : "Générer le tableau"}
      </Button>
    </div>
  )
}

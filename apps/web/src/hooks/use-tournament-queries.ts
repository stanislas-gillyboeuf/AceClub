import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { TournamentDetail, TournamentListItem } from "@/types/tournament"

export function useTournaments(organizationId: string) {
  return useQuery({
    queryKey: ["tournaments", organizationId],
    queryFn: () =>
      apiClient<{ tournaments: TournamentListItem[] }>(
        `/tournament/list?organizationId=${organizationId}`,
      ),
    enabled: !!organizationId,
  })
}

export function useTournamentDetail(tournamentId: string) {
  return useQuery({
    queryKey: ["tournament-detail", tournamentId],
    queryFn: () => apiClient<TournamentDetail>(`/tournament/detail?tournamentId=${tournamentId}`),
    enabled: !!tournamentId,
  })
}

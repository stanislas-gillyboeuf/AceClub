import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateTournamentInput } from "@/types/tournament"

function settleTournament(queryClient: ReturnType<typeof useQueryClient>, tournamentId?: string) {
  queryClient.invalidateQueries({ queryKey: ["tournaments"] })
  queryClient.invalidateQueries({ queryKey: ["club-events"] })
  if (tournamentId) queryClient.invalidateQueries({ queryKey: ["tournament-detail", tournamentId] })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTournamentInput) =>
      apiClient("/tournament/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => settleTournament(queryClient),
  })
}

export function useAddSeed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tournamentId: string; userId: string }) =>
      apiClient("/tournament/add-seed", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleTournament(queryClient, variables.tournamentId),
  })
}

export function useRemoveSeed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tournamentId: string; userId: string }) =>
      apiClient("/tournament/remove-seed", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleTournament(queryClient, variables.tournamentId),
  })
}

export function useAutoSeed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tournamentId: string) =>
      apiClient("/tournament/auto-seed", { method: "POST", body: JSON.stringify({ tournamentId }) }),
    onSettled: (_data, _err, tournamentId) => settleTournament(queryClient, tournamentId),
  })
}

export function useUpdateSeedNumber() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tournamentId: string; userId: string; seedNumber: number }) =>
      apiClient("/tournament/update-seed-number", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleTournament(queryClient, variables.tournamentId),
  })
}

export function useGenerateBracket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tournamentId: string) =>
      apiClient("/tournament/generate-bracket", {
        method: "POST",
        body: JSON.stringify({ tournamentId }),
      }),
    onSettled: (_data, _err, tournamentId) => settleTournament(queryClient, tournamentId),
  })
}

export function useRecordMatchWinner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tournamentMatchId: string; winnerUserId: string }) =>
      apiClient("/tournament/record-match-winner", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-detail"] })
    },
  })
}

export function useResetMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tournamentMatchId: string) =>
      apiClient("/tournament/reset-match", {
        method: "POST",
        body: JSON.stringify({ tournamentMatchId }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament-detail"] })
    },
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tournamentId: string) =>
      apiClient("/tournament/delete", { method: "POST", body: JSON.stringify({ tournamentId }) }),
    onSettled: () => settleTournament(queryClient),
  })
}

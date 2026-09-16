import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { LevelSport } from "@/types/club-level"

export function useCreateLevelCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; sport: LevelSport; name: string }) =>
      apiClient("/club-level/create-category", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-level-categories", variables.organizationId, variables.sport],
      })
    },
  })
}

export function useDeleteLevelCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; categoryId: string }) =>
      apiClient("/club-level/delete-category", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["club-level-categories"] })
    },
  })
}

export function useSetMemberLevel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      organizationId: string
      userId: string
      sport: LevelSport
      skillLevel: string
      verified: boolean
    }) => apiClient("/club-level/set-member-level", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["club-members"] })
      queryClient.invalidateQueries({
        queryKey: ["club-member-detail", variables.organizationId, variables.userId],
      })
    },
  })
}

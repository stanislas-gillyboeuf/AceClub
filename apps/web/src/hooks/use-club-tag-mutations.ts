import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubTag } from "@/types/tarif-grid"

export function useCreateClubTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; name: string }) =>
      apiClient<ClubTag>("/club-tag/create-tag", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["club-tags", variables.organizationId] })
    },
  })
}

export function useDeleteClubTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; tagId: string }) =>
      apiClient<{ success: boolean }>("/club-tag/delete-tag", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["club-tags", variables.organizationId] })
    },
  })
}

export function useSetMemberTags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string; tagIds: string[] }) =>
      apiClient<{ tagIds: string[] }>("/club-tag/set-member-tags", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["member-tags", variables.organizationId, variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["club-member-detail", variables.organizationId, variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["member-cotisations"] })
    },
  })
}

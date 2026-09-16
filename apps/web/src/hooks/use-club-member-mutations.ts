import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { BulkImportResult, BulkImportRow, UpdateClubMemberProfileInput } from "@/types/club-admin"

function settleClubMember(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string,
  userId?: string,
) {
  queryClient.invalidateQueries({ queryKey: ["club-members"] })
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["club-member-detail", organizationId, userId] })
  }
}

export function useUpdateClubMemberProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateClubMemberProfileInput) =>
      apiClient("/club-member/update-profile", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (_data, _err, variables) => {
      settleClubMember(queryClient, variables.organizationId, variables.userId)
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string; role: "admin" | "member" | "coach" }) =>
      apiClient("/club-member/update-role", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      settleClubMember(queryClient, variables.organizationId, variables.userId)
    },
  })
}

export function useBulkImportClubMembers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; rows: BulkImportRow[] }) =>
      apiClient<BulkImportResult>("/club-member/bulk-import", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (_data, _err, variables) => {
      settleClubMember(queryClient, variables.organizationId)
    },
  })
}

export function useAddClubMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; name: string; email: string; phone?: string }) =>
      apiClient<{ success: boolean; userId: string }>("/club-member/add", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (_data, _err, variables) => {
      settleClubMember(queryClient, variables.organizationId)
    },
  })
}

export function useRemoveClubMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string }) =>
      apiClient("/club-member/remove", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      settleClubMember(queryClient, variables.organizationId, variables.userId)
    },
  })
}

export function useAddMemberNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string; body: string }) =>
      apiClient("/club-member/add-note", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-member-notes", variables.organizationId, variables.userId],
      })
    },
  })
}

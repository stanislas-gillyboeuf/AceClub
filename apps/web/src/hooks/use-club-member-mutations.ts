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

export function useUpdateRestrictedAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      organizationId: string
      userId: string
      restrictedDashboardAccess: boolean
    }) =>
      apiClient("/club-member/update-access", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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

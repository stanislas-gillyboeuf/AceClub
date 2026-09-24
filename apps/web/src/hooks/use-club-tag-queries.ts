import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubTag } from "@/types/tarif-grid"

export function useClubTags(organizationId: string) {
  return useQuery({
    queryKey: ["club-tags", organizationId],
    queryFn: () => apiClient<{ tags: ClubTag[] }>(`/club-tag/list-tags?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useMemberTags(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["member-tags", organizationId, userId],
    queryFn: () =>
      apiClient<{ tagIds: string[] }>(
        `/club-tag/list-member-tags?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!organizationId && !!userId,
  })
}

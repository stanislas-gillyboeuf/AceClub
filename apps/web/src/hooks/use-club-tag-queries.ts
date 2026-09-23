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

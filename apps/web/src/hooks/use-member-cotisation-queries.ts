import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ListMemberCotisationsResponse } from "@/types/member-cotisation"

export function useMemberCotisations(organizationId: string, seasonLabel: string | undefined) {
  return useQuery({
    queryKey: ["member-cotisations", organizationId, seasonLabel],
    queryFn: () =>
      apiClient<ListMemberCotisationsResponse>(
        `/pricing/member-cotisations?organizationId=${organizationId}&seasonLabel=${encodeURIComponent(seasonLabel!)}`,
      ),
    enabled: !!organizationId && !!seasonLabel,
  })
}

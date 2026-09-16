import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ListCategoriesResponse, LevelSport } from "@/types/club-level"

export function useLevelCategories(organizationId: string, sport: LevelSport) {
  return useQuery({
    queryKey: ["club-level-categories", organizationId, sport],
    queryFn: () =>
      apiClient<ListCategoriesResponse>(
        `/club-level/list-categories?organizationId=${organizationId}&sport=${sport}`,
      ),
    enabled: !!organizationId,
  })
}

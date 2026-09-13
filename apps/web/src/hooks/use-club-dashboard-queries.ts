import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { HomeBoard } from "@/types/club-dashboard"

export function useHomeBoard(organizationId: string) {
  return useQuery({
    queryKey: ["club-home-board", organizationId],
    queryFn: () => apiClient<HomeBoard>(`/club-dashboard/home?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { DashboardSummary } from "@/types/club-dashboard"

export function useClubDashboardSummary(organizationId: string) {
  return useQuery({
    queryKey: ["club-dashboard-summary", organizationId],
    queryFn: () =>
      apiClient<DashboardSummary>(`/club-dashboard/summary?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

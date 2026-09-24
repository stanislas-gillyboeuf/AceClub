import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { HouseholdDetailResponse, HouseholdListItem } from "@/types/household"

export function useHouseholds(organizationId: string) {
  return useQuery({
    queryKey: ["households", organizationId],
    queryFn: () =>
      apiClient<{ households: HouseholdListItem[] }>(`/household/list?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useHouseholdDetail(organizationId: string, householdId: string | null | undefined) {
  return useQuery({
    queryKey: ["household-detail", organizationId, householdId],
    queryFn: () =>
      apiClient<HouseholdDetailResponse>(
        `/household/detail?organizationId=${organizationId}&householdId=${householdId}`,
      ),
    enabled: !!organizationId && !!householdId,
  })
}

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { VacationPeriod } from "@/types/vacation-period"

export function useVacationPeriods(organizationId: string) {
  return useQuery({
    queryKey: ["vacation-periods", organizationId],
    queryFn: () =>
      apiClient<{ vacationPeriods: VacationPeriod[] }>(
        `/vacation-period/list?organizationId=${organizationId}`,
      ),
    enabled: !!organizationId,
  })
}

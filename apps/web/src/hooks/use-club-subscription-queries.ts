import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { SubscriptionType, MemberSubscriptionSummary } from "@/types/club-subscription"

export function useSubscriptionTypes(organizationId: string) {
  return useQuery({
    queryKey: ["subscription-types", organizationId],
    queryFn: () =>
      apiClient<SubscriptionType[]>(`/club-subscription/types?organizationId=${organizationId}`),
    enabled: !!organizationId,
  })
}

export function useMemberSubscription(organizationId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["member-subscription", organizationId, userId],
    queryFn: () =>
      apiClient<MemberSubscriptionSummary | null>(
        `/club-subscription/member-subscription?organizationId=${organizationId}&userId=${userId}`,
      ),
    enabled: !!organizationId && !!userId,
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export function useCreateSubscriptionType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      organizationId: string
      name: string
      priceCents?: number
      durationDays?: number
    }) => apiClient("/club-subscription/types/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-types", variables.organizationId] })
    },
  })
}

export function useAssignSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      organizationId: string
      userId: string
      subscriptionTypeId: string
      amountDueCents?: number
    }) => apiClient("/club-subscription/assign", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["member-subscription", variables.organizationId, variables.userId],
      })
      queryClient.invalidateQueries({ queryKey: ["club-member-detail"] })
    },
  })
}

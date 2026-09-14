import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateVacationPeriodInput } from "@/types/vacation-period"

export function useCreateVacationPeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVacationPeriodInput) =>
      apiClient("/vacation-period/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vacation-periods", variables.organizationId] })
    },
  })
}

export function useDeleteVacationPeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vacationPeriodId: string) =>
      apiClient("/vacation-period/delete", { method: "POST", body: JSON.stringify({ vacationPeriodId }) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation-periods"] })
    },
  })
}

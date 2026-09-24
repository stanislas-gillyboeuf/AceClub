import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateHouseholdInput, Household, UpdateHouseholdInput } from "@/types/household"

// A household change moves a member's family rank, which moves their price — so member
// cotisations and every member file are refreshed along with the household itself.
function settleHousehold(queryClient: ReturnType<typeof useQueryClient>, organizationId: string) {
  queryClient.invalidateQueries({ queryKey: ["households", organizationId] })
  queryClient.invalidateQueries({ queryKey: ["household-detail", organizationId] })
  queryClient.invalidateQueries({ queryKey: ["club-member-detail", organizationId] })
  queryClient.invalidateQueries({ queryKey: ["member-cotisations"] })
}

export function useCreateHousehold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHouseholdInput) =>
      apiClient<{ household: Household }>("/household/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleHousehold(queryClient, variables.organizationId),
  })
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateHouseholdInput) =>
      apiClient<{ household: Household }>("/household/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleHousehold(queryClient, variables.organizationId),
  })
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; householdId: string }) =>
      apiClient<{ success: boolean }>("/household/delete", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleHousehold(queryClient, variables.organizationId),
  })
}

export function useSetMemberHousehold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string; householdId: string | null }) =>
      apiClient<{ userId: string; householdId: string | null }>("/household/set-member-household", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (_data, _err, variables) => settleHousehold(queryClient, variables.organizationId),
  })
}

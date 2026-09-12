import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AssignDuesInput, CreateDuesTypeInput, UpdateDuesTypeInput } from "@/types/dues"

export function useCreateDuesType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDuesTypeInput) =>
      apiClient("/dues/types/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dues-types", variables.organizationId] })
    },
  })
}

export function useUpdateDuesType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateDuesTypeInput) =>
      apiClient("/dues/types/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dues-types"] })
    },
  })
}

export function useAssignDues() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignDuesInput) =>
      apiClient("/dues/assign", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dues-types"] })
      queryClient.invalidateQueries({ queryKey: ["dues-assignments"] })
    },
  })
}

export function useMarkDuesPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { assignmentId: string; paidMethod?: string; notes?: string }) =>
      apiClient("/dues/mark-paid", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dues-types"] })
      queryClient.invalidateQueries({ queryKey: ["dues-assignments"] })
    },
  })
}

export function useWaiveDues() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { assignmentId: string; notes?: string }) =>
      apiClient("/dues/waive", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dues-types"] })
      queryClient.invalidateQueries({ queryKey: ["dues-assignments"] })
    },
  })
}

export function useSendDuesReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { assignmentId: string }) =>
      apiClient("/dues/send-reminder", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dues-assignments"] })
    },
  })
}

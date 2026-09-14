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

export function useDeleteDuesType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (duesTypeId: string) =>
      apiClient("/dues/types/delete", { method: "POST", body: JSON.stringify({ duesTypeId }) }),
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

/** Downloads the receipt PDF via an authenticated fetch (blob + object URL) rather than a
 * plain link — the API lives on a different subdomain, so a bare <a href> can't rely on the
 * session cookie being sent along with it. */
export function useDownloadDuesReceipt() {
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await fetch(`${API_URL}/api/dues/receipt?assignmentId=${assignmentId}`, {
        credentials: "include",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `API error: ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "recu-cotisation.pdf"
      link.click()
      URL.revokeObjectURL(url)
    },
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  MarkCotisationPaidInput,
  SendCotisationReminderInput,
  WaiveCotisationInput,
} from "@/types/member-cotisation"

function settleMemberCotisations(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string,
  seasonLabel: string,
) {
  queryClient.invalidateQueries({ queryKey: ["member-cotisations", organizationId, seasonLabel] })
}

export function useMarkCotisationPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MarkCotisationPaidInput) =>
      apiClient("/pricing/member-cotisations/mark-paid", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      settleMemberCotisations(queryClient, variables.organizationId, variables.seasonLabel)
    },
  })
}

export function useWaiveCotisation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WaiveCotisationInput) =>
      apiClient("/pricing/member-cotisations/waive", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      settleMemberCotisations(queryClient, variables.organizationId, variables.seasonLabel)
    },
  })
}

export function useSendCotisationReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendCotisationReminderInput) =>
      apiClient("/pricing/member-cotisations/send-reminder", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => {
      settleMemberCotisations(queryClient, variables.organizationId, variables.seasonLabel)
    },
  })
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

/** Downloads the receipt PDF via an authenticated fetch (blob + object URL) — same pattern as
 * useDownloadDuesReceipt, since the API lives on a different subdomain than the dashboard. */
export function useDownloadCotisationReceipt() {
  return useMutation({
    mutationFn: async (params: { organizationId: string; userId: string; seasonLabel: string }) => {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`${API_URL}/api/pricing/member-cotisations/receipt?${query}`, {
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

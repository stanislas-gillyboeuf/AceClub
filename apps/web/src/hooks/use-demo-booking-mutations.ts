import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import type { CreateManualBlockInput, UpdateDemoBookingSettingsInput } from "@/types/demo-booking"

export function useUpdateDemoBookingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateDemoBookingSettingsInput) =>
      apiClient("/demo-booking/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Réglages enregistrés")
    },
    onError: () => {
      toast.error("Échec de l'enregistrement")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-booking", "admin-settings"] })
    },
  })
}

export function useCreateDemoBookingBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateManualBlockInput) =>
      apiClient("/demo-booking/admin/blocks", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-booking", "admin-blocks"] })
    },
  })
}

export function useDeleteDemoBookingBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient(`/demo-booking/admin/blocks/${id}`, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-booking", "admin-blocks"] })
    },
  })
}

export function useGetDemoBookingGoogleAuthUrl() {
  return useMutation({
    mutationFn: () => apiClient<{ url: string }>("/demo-booking/admin/google/auth-url"),
  })
}

export function useExchangeDemoBookingGoogleCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) =>
      apiClient("/demo-booking/admin/google/exchange-code", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-booking", "google-status"] })
    },
  })
}

export function useDisconnectDemoBookingGoogle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient("/demo-booking/admin/google/disconnect", { method: "POST" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-booking", "google-status"] })
    },
  })
}

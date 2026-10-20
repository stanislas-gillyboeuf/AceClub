import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  AdminSettingsResponse,
  DemoBooking,
  DemoManualBlock,
  GoogleConnectionStatusResponse,
} from "@/types/demo-booking"

export function useDemoBookingAdminSettings() {
  return useQuery({
    queryKey: ["demo-booking", "admin-settings"],
    queryFn: () => apiClient<AdminSettingsResponse>("/demo-booking/admin/settings"),
  })
}

export function useDemoBookingAdminBookings(upcoming: boolean) {
  return useQuery({
    queryKey: ["demo-booking", "admin-bookings", upcoming],
    queryFn: () =>
      apiClient<{ bookings: DemoBooking[] }>(`/demo-booking/admin/bookings?upcoming=${upcoming}`),
  })
}

export function useDemoBookingAdminBlocks() {
  return useQuery({
    queryKey: ["demo-booking", "admin-blocks"],
    queryFn: () => apiClient<{ blocks: DemoManualBlock[] }>("/demo-booking/admin/blocks"),
  })
}

export function useDemoBookingGoogleStatus() {
  return useQuery({
    queryKey: ["demo-booking", "google-status"],
    queryFn: () => apiClient<GoogleConnectionStatusResponse>("/demo-booking/admin/google/status"),
    refetchInterval: 15000,
  })
}

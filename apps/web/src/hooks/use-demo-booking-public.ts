import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  CreateDemoBookingInput,
  DemoBooking,
  PublicAvailabilityResponse,
  PublicSlotsResponse,
} from "@/types/demo-booking"

export function useDemoBookingAvailability(yearMonth: string) {
  return useQuery({
    queryKey: ["demo-booking", "availability", yearMonth],
    queryFn: () =>
      apiClient<PublicAvailabilityResponse>(`/demo-booking/availability?yearMonth=${yearMonth}`),
  })
}

export function useDemoBookingSlots(date: string | null) {
  return useQuery({
    queryKey: ["demo-booking", "slots", date],
    queryFn: () => apiClient<PublicSlotsResponse>(`/demo-booking/slots?date=${date}`),
    enabled: !!date,
  })
}

export function useCreateDemoBookingPublic() {
  return useMutation({
    mutationFn: (data: CreateDemoBookingInput) =>
      apiClient<DemoBooking>("/demo-booking", { method: "POST", body: JSON.stringify(data) }),
  })
}

export function useNoSlotContact() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient("/demo-booking/no-slot-contact", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  })
}

export function useDemoBookingByToken(cancelToken: string | null) {
  return useQuery({
    queryKey: ["demo-booking", "by-token", cancelToken],
    queryFn: () => apiClient<DemoBooking>(`/demo-booking/${cancelToken}`),
    enabled: !!cancelToken,
    retry: false,
  })
}

export function useCancelDemoBookingPublic() {
  return useMutation({
    mutationFn: (cancelToken: string) =>
      apiClient<DemoBooking>(`/demo-booking/${cancelToken}/cancel`, { method: "POST" }),
  })
}

export function useRescheduleDemoBookingPublic() {
  return useMutation({
    mutationFn: ({ cancelToken, startAt }: { cancelToken: string; startAt: string }) =>
      apiClient<DemoBooking>(`/demo-booking/${cancelToken}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ startAt }),
      }),
  })
}

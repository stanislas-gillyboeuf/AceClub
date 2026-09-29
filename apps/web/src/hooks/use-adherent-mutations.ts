import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AdherentBookingDetail, BookingParticipantInput } from "@/types/adherent"

function settleAdherentEvents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["adherent-events"] })
  queryClient.invalidateQueries({ queryKey: ["adherent-my-event-registrations"] })
}

function settleAdherentBookings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["adherent-availability"] })
  queryClient.invalidateQueries({ queryKey: ["adherent-weekly-quota"] })
  queryClient.invalidateQueries({ queryKey: ["adherent-my-bookings"] })
}

export function useAdherentRegisterEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/register", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: () => settleAdherentEvents(queryClient),
  })
}

export function useAdherentCancelEventRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/cancel-registration", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: () => settleAdherentEvents(queryClient),
  })
}

interface CreateBookingInput {
  courtId: string
  date: string
  startTime: string
  participants: BookingParticipantInput[]
}

export function useAdherentCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      apiClient<AdherentBookingDetail>("/court/book", { method: "POST", body: JSON.stringify(input) }),
    onSettled: () => settleAdherentBookings(queryClient),
  })
}

export function useAdherentJoinBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { bookingId: string; userId?: string; guestName?: string }) =>
      apiClient("/court/join-booking", { method: "POST", body: JSON.stringify(input) }),
    onSettled: () => settleAdherentBookings(queryClient),
  })
}

export function useAdherentCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiClient("/court/cancel-booking", { method: "POST", body: JSON.stringify({ bookingId }) }),
    onSettled: () => settleAdherentBookings(queryClient),
  })
}

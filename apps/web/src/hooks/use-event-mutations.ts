import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CreateEventInput, UpdateEventInput } from "@/types/event"

function settleEvents(queryClient: ReturnType<typeof useQueryClient>, eventId?: string) {
  queryClient.invalidateQueries({ queryKey: ["club-events"] })
  if (eventId) queryClient.invalidateQueries({ queryKey: ["club-event-participants", eventId] })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventInput) =>
      apiClient("/event/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: () => settleEvents(queryClient),
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateEventInput) =>
      apiClient("/event/update", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleEvents(queryClient, variables.eventId),
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { eventId: string; status: string }) =>
      apiClient("/event/update-status", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleEvents(queryClient, variables.eventId),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/delete", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: () => settleEvents(queryClient),
  })
}

export function useCancelEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      apiClient("/event/cancel", { method: "POST", body: JSON.stringify({ eventId }) }),
    onSettled: (_data, _err, eventId) => settleEvents(queryClient, eventId),
  })
}

export function useRemoveEventParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { eventId: string; userId: string }) =>
      apiClient("/event/remove-participant", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (_data, _err, variables) => settleEvents(queryClient, variables.eventId),
  })
}

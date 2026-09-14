import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { ClubEvent, EventParticipant } from "@/types/event"

export function useOrganizationEvents(organizationId: string, status?: string) {
  const params = new URLSearchParams({ organizationId })
  if (status) params.set("status", status)

  return useQuery({
    queryKey: ["club-events", organizationId, status],
    queryFn: () => apiClient<ClubEvent[]>(`/event/list-organization-events?${params.toString()}`),
    enabled: !!organizationId,
  })
}

export function useEventParticipants(eventId: string, status?: string) {
  const params = new URLSearchParams({ eventId, limit: "100" })
  if (status) params.set("status", status)

  return useQuery({
    queryKey: ["club-event-participants", eventId, status],
    queryFn: () => apiClient<EventParticipant[]>(`/event/list-participants?${params.toString()}`),
    enabled: !!eventId,
  })
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Event, EventParticipant } from "@/types/event";

export function useEvents(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["events", params, qs],
    queryFn: () =>
      apiClient<{ events: Event[]; total: number }>(`/event/list${qs ? `?${qs}` : ""}`),
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiClient<Event>(`/event/get?eventId=${eventId}`),
    enabled: !!eventId,
  });
}

export function useMyEvents(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["my-events", params, qs],
    queryFn: () =>
      apiClient<{ events: Event[]; total: number }>(`/event/list-my-events${qs ? `?${qs}` : ""}`),
  });
}

export function useEventParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: () =>
      apiClient<{ participants: EventParticipant[]; total: number }>(
        `/event/list-participants?eventId=${eventId}`,
      ),
    enabled: !!eventId,
  });
}

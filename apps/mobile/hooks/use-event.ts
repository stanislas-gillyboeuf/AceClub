import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services/event";
import type { CreateEventRequest, UpdateEventRequest, EventStatus } from "@/types/event";

// --- Queries ---

export function useMyEvents(params?: {
  status?: string;
  timeFilter?: "upcoming" | "past";
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["event", "my-events", params],
    queryFn: () => eventService.listMyEvents(params),
  });
}

export function useInfiniteEvents(params?: {
  organizationId?: string;
  status?: string;
  sortBy?: "upcoming" | "nearest" | "recent";
  latitude?: number;
  longitude?: number;
  limit?: number;
}) {
  const limit = params?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: ["event", "infinite", params],
    queryFn: ({ pageParam }) =>
      eventService.listEvents({ ...params, cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventService.getEvent(eventId),
    enabled: !!eventId,
  });
}

// --- Mutations ---

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.register(eventId),
    onSettled: (_data, _err, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", "my-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", "infinite"] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.cancelRegistration(eventId),
    onSettled: (_data, _err, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", "my-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", "infinite"] });
    },
  });
}

// --- Admin ---

export function useAdminEvents(params?: {
  status?: string;
  organizationId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["event", "admin-list", params],
    queryFn: () => eventService.adminListEvents(params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventRequest) => eventService.updateEvent(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["event", "infinite"] });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: string; status: EventStatus }) =>
      eventService.updateEventStatus(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["event", "infinite"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.deleteEvent(eventId),
    onSettled: (_data, _err, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", "admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["event", "infinite"] });
    },
  });
}

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services/event";
import { queryKeys } from "@/lib/query-keys";
import { getNextPageParamFromCursor } from "@/hooks/use-infinite-pagination";
import type { CreateEventRequest, UpdateEventRequest, EventStatus, EventSortBy } from "@/types/event";

// --- Queries ---

export function useMyEvents(params?: {
  status?: string;
  timeFilter?: "upcoming" | "past";
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.event.myEvents(params),
    queryFn: () => eventService.listMyEvents(params),
  });
}

export function useInfiniteEvents(params?: {
  organizationId?: string;
  status?: string;
  sortBy?: EventSortBy;
  latitude?: number;
  longitude?: number;
  limit?: number;
}) {
  const limit = params?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: queryKeys.event.infinite(params),
    queryFn: ({ pageParam }) =>
      eventService.listEvents({ ...params, cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: getNextPageParamFromCursor,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.event.detail(eventId),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.myEventsAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.infiniteAll() });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.cancelRegistration(eventId),
    onSettled: (_data, _err, eventId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.myEventsAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.infiniteAll() });
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
    queryKey: queryKeys.event.adminList(params),
    queryFn: () => eventService.adminListEvents(params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.createEvent(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEventRequest) => eventService.updateEvent(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.adminListAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.infiniteAll() });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { eventId: string; status: EventStatus }) =>
      eventService.updateEventStatus(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.adminListAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.infiniteAll() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventService.deleteEvent(eventId),
    onSettled: (_data, _err, eventId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.adminListAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.event.infiniteAll() });
    },
  });
}

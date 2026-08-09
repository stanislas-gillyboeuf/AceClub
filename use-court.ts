import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtService } from "@/services/court";
import { queryKeys } from "@/lib/query-keys";
import type { BookCourtRequest } from "@/types/court";

// --- Queries ---

export function useCourts(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.court.list(organizationId),
    queryFn: () => courtService.listCourts(organizationId),
    enabled: !!organizationId,
  });
}

export function useCourtAvailability(courtId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.court.availability(courtId, date),
    queryFn: () => courtService.getAvailability(courtId, date),
    enabled: !!courtId && !!date,
    // Availability changes as other people book — keep it fresh.
    staleTime: 30_000,
  });
}

export function useMyBookings(params?: {
  timeFilter?: "upcoming" | "past";
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.court.myBookings(params),
    queryFn: () => courtService.listMyBookings(params),
  });
}

// --- Mutations ---

export function useBookCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookCourtRequest) => courtService.book(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.court.myBookingsAll() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.court.availability(variables.courtId, variables.startTime.slice(0, 10)),
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => courtService.cancelBooking(bookingId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.court.myBookingsAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.court.all });
    },
  });
}

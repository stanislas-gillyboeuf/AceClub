import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtService } from "@/services/court";
import { queryKeys } from "@/lib/query-keys";
import type { CreateBookingRequest, MyBookingsFilter } from "@/types/court";

export function useCourts(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.court.list(organizationId),
    queryFn: () => courtService.listCourts(organizationId!),
    enabled: !!organizationId,
  });
}

export function useCourtAvailability(courtId?: string, date?: string) {
  return useQuery({
    queryKey: queryKeys.court.availability(courtId, date),
    queryFn: () => courtService.listAvailability(courtId!, date!),
    enabled: !!courtId && !!date,
  });
}

export function useCourtBookingEnabled(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.court.bookingEnabled(organizationId),
    queryFn: () => courtService.getBookingEnabled(organizationId!),
    enabled: !!organizationId,
    select: (data) => data.enabled,
  });
}

export function useMyBookings(filter: MyBookingsFilter) {
  return useQuery({
    queryKey: queryKeys.court.myBookings(filter),
    queryFn: () => courtService.listMyBookings(filter),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => courtService.createBooking(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.court.availabilityAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.court.myBookingsAll() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => courtService.cancelBooking(bookingId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.court.availabilityAll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.court.myBookingsAll() });
    },
  });
}

import { api } from "@/lib/api";
import type {
  ListCourtsResponse,
  AvailabilityResponse,
  ListMyBookingsResponse,
  CourtBooking,
  BookCourtRequest,
} from "@/types/court";

export const courtService = {
  listCourts: (organizationId: string) =>
    api.get<ListCourtsResponse>("/court/list", { organizationId }),

  getAvailability: (courtId: string, date: string) =>
    api.get<AvailabilityResponse>("/court/availability", { courtId, date }),

  listMyBookings: (params?: { timeFilter?: "upcoming" | "past"; limit?: number; offset?: number }) =>
    api.get<ListMyBookingsResponse>("/court/list-my-bookings", params),

  book: (data: BookCourtRequest) =>
    api.post<{ data: CourtBooking }>("/court/book", data),

  cancelBooking: (bookingId: string) =>
    api.post<{ data: CourtBooking }>("/court/cancel-booking", { bookingId }),
};

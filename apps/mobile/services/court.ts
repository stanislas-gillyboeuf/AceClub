import { api } from "@/lib/api";
import type {
  Court,
  CourtAvailability,
  CourtBooking,
  CreateBookingRequest,
  MyBookingsFilter,
} from "@/types/court";

export const courtService = {
  listCourts: (organizationId: string) =>
    api.get<Court[]>("/court/list", { organizationId }),

  listAvailability: (courtId: string, date: string) =>
    api.get<CourtAvailability>("/court/availability", { courtId, date }),

  listMyBookings: (filter: MyBookingsFilter) =>
    api.get<CourtBooking[]>("/court/my-bookings", { filter }),

  createBooking: (data: CreateBookingRequest) =>
    api.post<CourtBooking>("/court/book", data),

  cancelBooking: (bookingId: string) =>
    api.post<CourtBooking>("/court/cancel-booking", { bookingId }),

  getBookingEnabled: (organizationId: string) =>
    api.get<{ enabled: boolean }>("/court/booking-enabled", { organizationId }),
};

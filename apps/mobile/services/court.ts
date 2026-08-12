import { api } from "@/lib/api";
import type {
  Court,
  CourtAvailability,
  CourtBooking,
  CreateBookingRequest,
  BookForClubRequest,
  MyBookingsFilter,
  CreateCourtRequest,
  UpdateCourtRequest,
  CourtSettings,
  UpsertSettingsRequest,
  WeeklyQuota,
} from "@/types/court";

export const courtService = {
  listCourts: (organizationId: string) =>
    api.get<Court[]>("/court/list", { organizationId }),

  listAllForOrg: (organizationId: string) =>
    api.get<Court[]>("/court/list-all-for-org", { organizationId }),

  listAvailability: (courtId: string, date: string) =>
    api.get<CourtAvailability>("/court/availability", { courtId, date }),

  listMyBookings: (filter: MyBookingsFilter) =>
    api.get<CourtBooking[]>("/court/my-bookings", { filter }),

  createBooking: (data: CreateBookingRequest) =>
    api.post<CourtBooking>("/court/book", data),

  bookForClub: (data: BookForClubRequest) =>
    api.post<CourtBooking>("/court/book-for-club", data),

  cancelBooking: (bookingId: string) =>
    api.post<CourtBooking>("/court/cancel-booking", { bookingId }),

  getBookingEnabled: (organizationId: string) =>
    api.get<{ enabled: boolean }>("/court/booking-enabled", { organizationId }),

  createCourt: (data: CreateCourtRequest) => api.post<Court>("/court/create", data),

  updateCourt: (data: UpdateCourtRequest) => api.post<Court>("/court/update", data),

  getSettings: (organizationId: string) =>
    api.get<CourtSettings>("/court/settings", { organizationId }),

  upsertSettings: (data: UpsertSettingsRequest) =>
    api.post<CourtSettings>("/court/settings/update", data),

  getWeeklyQuota: (organizationId: string) =>
    api.get<WeeklyQuota>("/court/my-weekly-quota", { organizationId }),
};

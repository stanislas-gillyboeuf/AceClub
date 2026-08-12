export type CourtSurface = "clay" | "hard" | "grass" | "carpet";
export type CourtBookingStatus = "confirmed" | "cancelled";
export type CourtAccessPolicy = "members_only" | "open";
export type CourtCancellationPolicy = "anytime" | "window" | "disabled";
export const SLOT_DURATIONS = [30, 45, 60, 90, 120] as const;
export type SlotDuration = (typeof SLOT_DURATIONS)[number];

export interface Court {
  id: string;
  organizationId: string;
  name: string;
  surface: CourtSurface | null;
  indoor: boolean;
  isActive: boolean;
  accessPolicy: CourtAccessPolicy;
  pricePerHour: number | null;
  slotDurationMinutes: number;
  cancellationPolicy: CourtCancellationPolicy;
  cancellationWindowHours: number | null;
  createdAt: string;
}

export interface CourtSlot {
  startTime: string; // "HH:mm"
  start: string;
  end: string;
  available: boolean;
  bookedAsClub: boolean;
  purpose: string | null;
}

export interface CourtAvailability {
  courtId: string;
  date: string;
  slots: CourtSlot[];
}

export interface CourtBooking {
  id: string;
  courtId: string;
  startAt: string;
  endAt: string;
  status: CourtBookingStatus;
  purpose: string | null;
  bookedAsClub: boolean;
  createdAt: string;
  courtName: string;
  organizationName: string;
}

export interface CreateBookingRequest {
  courtId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
}

export interface BookForClubRequest {
  courtId: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  purpose?: string;
}

export type MyBookingsFilter = "upcoming" | "past";

export interface CreateCourtRequest {
  organizationId: string;
  name: string;
  surface?: CourtSurface;
  indoor?: boolean;
  accessPolicy?: CourtAccessPolicy;
  pricePerHour?: number;
  slotDurationMinutes?: SlotDuration;
  cancellationPolicy?: CourtCancellationPolicy;
  cancellationWindowHours?: number;
}

export interface UpdateCourtRequest {
  courtId: string;
  name?: string;
  surface?: CourtSurface;
  indoor?: boolean;
  isActive?: boolean;
  accessPolicy?: CourtAccessPolicy;
  pricePerHour?: number | null;
  slotDurationMinutes?: SlotDuration;
  cancellationPolicy?: CourtCancellationPolicy;
  cancellationWindowHours?: number;
}

export interface CourtSettings {
  openingHour: number;
  closingHour: number;
  maxBookingsPerWeekWeekday: number | null;
  maxBookingsPerWeekWeekend: number | null;
}

export interface UpsertSettingsRequest extends CourtSettings {
  organizationId: string;
}

export interface WeeklyQuotaBucket {
  used: number;
  limit: number | null;
}

export interface WeeklyQuota {
  weekday: WeeklyQuotaBucket;
  weekend: WeeklyQuotaBucket;
}

export type CourtSport = "tennis" | "padel";
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
  sport: CourtSport;
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

export interface BookingParticipant {
  slotIndex: number;
  userId: string | null;
  name: string | null;
}

export interface BoardHourCell {
  hour: number;
  status: "free" | "booked" | "mine" | "past";
  bookedByLabel?: string;
  bookedAsClub?: boolean;
  purpose?: string | null;
}

export interface BoardCourt {
  id: string;
  name: string;
  surface: CourtSurface | null;
  indoor: boolean;
  accessPolicy: CourtAccessPolicy;
  cancellationPolicy: CourtCancellationPolicy;
  cancellationWindowHours: number | null;
  pricePerHour: number | null;
  slotDurationMinutes: number;
  hours: BoardHourCell[];
}

export interface CourtBoard {
  date: string;
  sport: CourtSport;
  courts: BoardCourt[];
}

export interface FrequentPartner {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface BookingParticipantInput {
  userId?: string;
  guestName?: string;
}

export interface BookingDetail {
  id: string;
  courtId: string;
  userId: string;
  startAt: string;
  endAt: string;
  status: CourtBookingStatus;
  purpose: string | null;
  bookedAsClub: boolean;
  createdAt: string;
  courtName: string;
  organizationId: string;
  sport: CourtSport;
  surface: CourtSurface | null;
  indoor: boolean;
  cancellationPolicy: CourtCancellationPolicy;
  cancellationWindowHours: number | null;
  participants: BookingParticipant[];
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
  sport: CourtSport;
  organizationName: string;
  participantCount: number;
}

export interface CreateBookingRequest {
  courtId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  participants?: BookingParticipantInput[];
}

export interface BookForClubRequest {
  courtId: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  purpose?: string;
}

export type MyBookingsFilter = "upcoming" | "past" | "all";

export interface CreateCourtRequest {
  organizationId: string;
  name: string;
  sport?: CourtSport;
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
  sport?: CourtSport;
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

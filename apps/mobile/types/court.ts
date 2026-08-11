export type CourtSurface = "clay" | "hard" | "grass" | "carpet";
export type CourtBookingStatus = "confirmed" | "cancelled";
export type CourtAccessPolicy = "members_only" | "open";

export interface Court {
  id: string;
  organizationId: string;
  name: string;
  surface: CourtSurface | null;
  indoor: boolean;
  isActive: boolean;
  accessPolicy: CourtAccessPolicy;
  createdAt: string;
}

export interface CourtSlot {
  startTime: string; // "HH:00"
  start: string;
  end: string;
  available: boolean;
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
  createdAt: string;
  courtName: string;
  organizationName: string;
}

export interface CreateBookingRequest {
  courtId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:00"
}

export type MyBookingsFilter = "upcoming" | "past";

export type CourtSurface = "clay" | "hard" | "grass" | "carpet";
export type CourtLocation = "indoor" | "outdoor";
export type CourtBookingStatus = "confirmed" | "cancelled";

export interface Court {
  id: string;
  organizationId: string;
  name: string;
  surface: CourtSurface;
  location: CourtLocation;
  pricePerHour: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCourtsResponse {
  data: Court[];
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  data: {
    court: Court;
    date: string;
    slots: AvailabilitySlot[];
  };
}

export interface CourtBooking {
  id: string;
  startTime: string;
  endTime: string;
  status: CourtBookingStatus;
  createdAt: string;
  courtId: string;
  courtName: string;
  courtSurface: CourtSurface;
  courtLocation: CourtLocation;
  pricePerHour: number | null;
  organizationId: string;
  organizationName: string;
  organizationLogo: string | null;
}

export interface ListMyBookingsResponse {
  data: CourtBooking[];
}

export interface BookCourtRequest {
  courtId: string;
  startTime: string;
  endTime: string;
}

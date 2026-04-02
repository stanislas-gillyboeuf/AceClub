export type EventStatus =
  | "draft"
  | "presale"
  | "on_sale"
  | "completed"
  | "full"
  | "cancelled"
  | "archived";

export type EventVisibility = "public" | "organization";

export type EventSortBy = "upcoming" | "nearest" | "recent" | "past";

export type RegistrationStatus = "registered" | "waitlisted" | "cancelled";

export interface EventSummary {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  maxParticipants: number | null;
  isFree: boolean;
  price: number | null;
  paymentLink: string | null;
  visibility: EventVisibility;
  status: EventStatus;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  organizationName: string | null;
  organizationLogo: string | null;
  organizationSlug: string | null;
  organizationAddress: string | null;
  organizationLatitude: number | null;
  organizationLongitude: number | null;
  participantCount: number;
}

export interface MyEvent extends EventSummary {
  userId: string;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
}

export interface EventDetail extends EventSummary {
  userId: string;
  waitlistCount: number;
  userRegistrationStatus: RegistrationStatus | null;
}

export interface ListEventsResponse {
  data: EventSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  isFree?: boolean;
  price?: number;
  paymentLink?: string;
  visibility?: EventVisibility;
  status?: EventStatus;
  organizationId: string;
}

export interface UpdateEventRequest {
  eventId: string;
  name?: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number | null;
  isFree?: boolean;
  price?: number;
  paymentLink?: string;
  visibility?: EventVisibility;
}

export interface AdminEventItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  visibility: EventVisibility;
  organizationId: string | null;
  participantCount: number;
  maxParticipants: number | null;
  createdAt: string;
}

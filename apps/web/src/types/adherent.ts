import type { EventStatus } from "./event"

/** Minimal, unauthenticated club info exposed by GET /organization/public-by-slug. */
export interface PublicOrganization {
  id: string
  name: string
  slug: string
  logo: string | null
}

export type AdherentEventRegistrationStatus = "registered" | "waitlisted" | "cancelled" | null

export interface AdherentEvent {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  startDate: string
  endDate: string
  address: string | null
  maxParticipants: number | null
  isFree: boolean
  price: number | null
  paymentLink: string | null
  status: EventStatus
  organizationId: string | null
  participantCount: number
  /** Merged client-side from /event/list-my-events — absent from /event/list itself. */
  userRegistrationStatus: AdherentEventRegistrationStatus
}

/** One row of GET /event/list-my-events — a plain array, each item is the event itself
 * (spread server-side) plus `registrationStatus`. `id` here is the EVENT id, not a
 * registration id. */
export interface MyEventRegistration {
  id: string
  registrationStatus: "registered" | "waitlisted" | "cancelled"
}

export type CourtSport = "tennis" | "padel"
export type CourtSurface = "clay" | "hard" | "grass" | "carpet"
export type CourtCancellationPolicy = "anytime" | "window" | "disabled"
export type CourtBookingStatus = "confirmed" | "cancelled"

/** One row of GET /court/list. */
export interface AdherentCourt {
  id: string
  organizationId: string
  name: string
  sport: CourtSport
  surface: CourtSurface | null
  indoor: boolean
  isActive: boolean
  accessPolicy: "members_only" | "open"
  pricePerHour: number | null
  slotDurationMinutes: number
  cancellationPolicy: CourtCancellationPolicy
  cancellationWindowHours: number | null
}

export interface AdherentAvailabilitySlot {
  startTime: string
  start: string
  end: string
  available: boolean
  bookedAsClub: boolean
  purpose: string | null
}

/** GET /court/availability response. */
export interface AdherentAvailability {
  courtId: string
  date: string
  slots: AdherentAvailabilitySlot[]
}

/** GET /court/my-weekly-quota response. `limit: null` means unlimited. */
export interface AdherentWeeklyQuota {
  weekday: { used: number; limit: number | null }
  weekend: { used: number; limit: number | null }
}

/** One row of GET /court/my-bookings — NOT organization-scoped server-side, must be
 * filtered client-side to the current club. */
export interface AdherentBooking {
  id: string
  courtId: string
  startAt: string
  endAt: string
  status: CourtBookingStatus
  purpose: string | null
  bookedAsClub: boolean
  createdAt: string
  courtName: string
  sport: CourtSport
  organizationId: string
  organizationName: string
  participantCount: number
}

export interface AdherentBookingParticipant {
  userId: string | null
  name: string
}

/** POST /court/book response. */
export interface AdherentBookingDetail extends AdherentBooking {
  participants: AdherentBookingParticipant[]
}

/** One row of GET /court/search-members. */
export interface AdherentMember {
  userId: string
  name: string
  avatarUrl: string | null
}

export interface BookingParticipantInput {
  userId?: string
  guestName?: string
}

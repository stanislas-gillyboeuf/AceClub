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

export interface BoardHourCell {
  hour: number
  status: "free" | "booked" | "mine" | "past"
  bookedByLabel?: string
  bookedAsClub?: boolean
}

/** One court's row on GET /court/board. */
export interface BoardCourt {
  id: string
  name: string
  surface: CourtSurface | null
  indoor: boolean
  accessPolicy: "members_only" | "open"
  cancellationPolicy: CourtCancellationPolicy
  cancellationWindowHours: number | null
  pricePerHour: number | null
  slotDurationMinutes: number
  hours: BoardHourCell[]
}

/** GET /court/board response — the same day/sport grid the mobile app's booking screen uses. */
export interface CourtBoard {
  date: string
  sport: CourtSport
  courts: BoardCourt[]
}

/** GET /court/settings response. `bookingWindowDays: null` means the default (today + 6). */
export interface CourtSettings {
  maxBookingsPerWeekWeekday: number | null
  maxBookingsPerWeekWeekend: number | null
  bookingWindowDays: number | null
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

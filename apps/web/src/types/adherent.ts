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

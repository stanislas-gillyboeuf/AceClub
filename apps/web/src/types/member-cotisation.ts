import type { Breakdown } from "./tarif-grid"

export type MemberCotisationStatus = "not_generated" | "pending" | "paid" | "waived"

export interface MemberCotisation {
  userId: string
  name: string
  email: string
  amountCents: number | null
  status: MemberCotisationStatus
  breakdown: Breakdown
  recordId: string | null
}

export interface ListMemberCotisationsResponse {
  gridId: string | null
  seasonLabel: string
  members: MemberCotisation[]
}

export interface MarkCotisationPaidInput {
  organizationId: string
  userId: string
  seasonLabel: string
  paidMethod?: string
}

export interface WaiveCotisationInput {
  organizationId: string
  userId: string
  seasonLabel: string
  notes?: string
}

export interface SendCotisationReminderInput {
  organizationId: string
  userId: string
  seasonLabel: string
}

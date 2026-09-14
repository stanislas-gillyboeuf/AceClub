export type EventStatus =
  | "draft"
  | "presale"
  | "on_sale"
  | "completed"
  | "full"
  | "cancelled"
  | "archived"

export type EventVisibility = "public" | "organization"

export interface ClubEvent {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  startDate: string
  endDate: string
  address: string | null
  latitude: number | null
  longitude: number | null
  maxParticipants: number | null
  isFree: boolean
  price: number | null
  paymentLink: string | null
  visibility: EventVisibility
  status: EventStatus
  userId: string
  organizationId: string | null
  createdAt: string
  updatedAt: string
  participantCount: number
  waitlistCount: number
}

export interface EventParticipant {
  id: string
  userId: string
  status: "registered" | "waitlisted" | "cancelled"
  registeredAt: string
  userName: string
  userImage: string | null
}

export interface CreateEventInput {
  organizationId: string
  name: string
  description?: string
  coverImage?: string
  startDate: string
  endDate: string
  address?: string
  latitude?: number
  longitude?: number
  maxParticipants?: number
  isFree?: boolean
  price?: number
  paymentLink?: string
  visibility?: EventVisibility
}

export interface UpdateEventInput {
  eventId: string
  name?: string
  description?: string | null
  startDate?: string
  endDate?: string
  address?: string | null
  maxParticipants?: number | null
  isFree?: boolean
  price?: number | null
  paymentLink?: string | null
  visibility?: EventVisibility
}

export type CourtSport = "tennis" | "padel"
export type CourtSurface = "clay" | "hard" | "grass" | "carpet"
export type CourtAccessPolicy = "members_only" | "open"
export type CourtCancellationPolicy = "anytime" | "window" | "disabled"

export interface Court {
  id: string
  organizationId: string
  name: string
  sport: CourtSport
  surface: CourtSurface | null
  indoor: boolean
  isActive: boolean
  accessPolicy: CourtAccessPolicy
  pricePerHour: number | null
  slotDurationMinutes: number
  cancellationPolicy: CourtCancellationPolicy
  cancellationWindowHours: number | null
  createdAt: string
}

export interface CourtSettings {
  openingHour: number
  closingHour: number
  maxBookingsPerWeekWeekday: number | null
  maxBookingsPerWeekWeekend: number | null
  bookingWindowDays: number | null
}

export interface CreateCourtInput {
  organizationId: string
  name: string
  sport?: CourtSport
  surface?: CourtSurface
  indoor?: boolean
  accessPolicy?: CourtAccessPolicy
  pricePerHour?: number
  slotDurationMinutes?: number
  cancellationPolicy?: CourtCancellationPolicy
  cancellationWindowHours?: number
}

export interface UpdateCourtInput {
  courtId: string
  name?: string
  sport?: CourtSport
  surface?: CourtSurface
  indoor?: boolean
  isActive?: boolean
  accessPolicy?: CourtAccessPolicy
  pricePerHour?: number | null
  slotDurationMinutes?: number
  cancellationPolicy?: CourtCancellationPolicy
  cancellationWindowHours?: number
}

export interface UpsertCourtSettingsInput {
  organizationId: string
  openingHour: number
  closingHour: number
  maxBookingsPerWeekWeekday?: number | null
  maxBookingsPerWeekWeekend?: number | null
  bookingWindowDays?: number | null
}

export interface AdminBoardHourCell {
  hour: number
  status: "past" | "free" | "booked"
  bookingId?: string
  bookedByUserId?: string
  bookedByName?: string
  bookedByLabel?: string
  bookedAsClub?: boolean
  purpose?: string | null
}

export interface AdminBoardCourt {
  id: string
  name: string
  surface: CourtSurface | null
  indoor: boolean
  accessPolicy: CourtAccessPolicy
  cancellationPolicy: CourtCancellationPolicy
  cancellationWindowHours: number | null
  pricePerHour: number | null
  slotDurationMinutes: number
  hours: AdminBoardHourCell[]
}

export interface AdminBoard {
  date: string
  sport: CourtSport
  courts: AdminBoardCourt[]
}

export interface SearchMemberResult {
  userId: string
  name: string
  avatarUrl: string | null
}

export interface BookForClubInput {
  courtId: string
  startAt: string
  endAt: string
  purpose?: string
  userId?: string
}

export interface CancelBookingInput {
  bookingId: string
  override?: boolean
}

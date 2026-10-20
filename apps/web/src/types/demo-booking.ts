export type DemoBookingRole = "president" | "manager" | "coach" | "other"
export type DemoBookingStatus = "confirmed" | "cancelled"

export interface DemoBooking {
  id: string
  startAt: string
  endAt: string
  status: DemoBookingStatus
  firstName: string
  lastName: string
  email: string
  clubName: string
  phone: string | null
  role: DemoBookingRole
  note: string | null
  utmSource: string | null
  cancelToken: string
  googleEventId: string | null
  googleMeetLink: string | null
  reminderDayBeforeSentAt: string | null
  reminderHourBeforeSentAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DemoAvailabilityRule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface DemoBookingSettings {
  demoDurationMinutes: number
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  minNoticeHours: number
  horizonDays: number
  maxPerDay: number
  referenceTimezone: string
}

export interface AdminSettingsResponse {
  settings: DemoBookingSettings
  rules: DemoAvailabilityRule[]
}

export interface UpdateDemoBookingSettingsInput extends DemoBookingSettings {
  rules: DemoAvailabilityRule[]
}

export interface DemoManualBlock {
  id: string
  date: string | null
  startAt: string | null
  endAt: string | null
  reason: string | null
  createdAt: string
}

export interface CreateManualBlockInput {
  date?: string
  startAt?: string
  endAt?: string
  reason?: string
}

export interface PublicAvailabilityResponse {
  dates: string[]
}

export interface PublicSlot {
  startAt: string
  endAt: string
}

export interface PublicSlotsResponse {
  date: string
  durationMinutes: number
  slots: PublicSlot[]
}

export interface CreateDemoBookingInput {
  startAt: string
  firstName: string
  lastName: string
  email: string
  clubName: string
  phone?: string
  role: DemoBookingRole
  note?: string
  utmSource?: string
  website?: string
}

export type GoogleConnectionStatus = "connected" | "error" | "disconnected"

export interface GoogleConnectionStatusResponse {
  status: GoogleConnectionStatus
  calendarId?: string
  lastErrorMessage?: string | null
  lastErrorAt?: string | null
  updatedAt?: string
}

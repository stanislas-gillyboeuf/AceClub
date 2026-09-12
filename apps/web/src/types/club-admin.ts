export interface ClubOrganization {
  id: string
  name: string
  slug: string
  logo: string | null
}

export interface ClubMemberListItem {
  memberId: string
  role: string
  restrictedDashboardAccess: boolean
  memberSince: string
  userId: string
  userName: string
  userEmail: string
  userImage: string | null
  isGhost: boolean | null
  licenseNumber: string | null
  licenseValidUntil: string | null
  recentBookingCount: number
}

export interface ListClubMembersParams {
  organizationId: string
  search?: string
  limit?: number
  offset?: number
}

export interface ListClubMembersResponse {
  members: ClubMemberListItem[]
  total: number
}

export interface ClubMemberBooking {
  id: string
  courtName: string
  sport: string
  startAt: string
  endAt: string
  status: string
}

export interface ClubMemberDetail {
  member: ClubMemberListItem & {
    userPhone: string | null
    phoneOverride: string | null
    notes: string | null
  }
  bookings: ClubMemberBooking[]
}

export interface UpdateClubMemberProfileInput {
  organizationId: string
  userId: string
  licenseNumber?: string | null
  licenseValidUntil?: string | null
  phoneOverride?: string | null
  notes?: string | null
}

export interface BulkImportRow {
  name: string
  email: string
  phone?: string
  licenseNumber?: string
  licenseValidUntil?: string
  dateOfBirth?: string
}

export interface BulkImportResult {
  created: number
  updated: number
  skipped: { row: number; reason: string }[]
}

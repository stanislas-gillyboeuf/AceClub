export type HouseholdRankSource = "override" | "frozen" | "computed"

export interface Household {
  id: string
  organizationId: string
  name: string
  payerUserId: string | null
  contactEmail: string | null
  createdAt: string
  updatedAt: string
}

export interface HouseholdListItem {
  id: string
  name: string
  payerUserId: string | null
  payerName: string | null
  contactEmail: string | null
  memberCount: number
}

export interface HouseholdMember {
  userId: string
  name: string
  email: string
  role: string
  isAdherent: boolean
  householdRankOverride: number | null
  isPayer: boolean
}

export interface HouseholdDetailResponse {
  household: Household
  members: HouseholdMember[]
}

export interface CreateHouseholdInput {
  organizationId: string
  name: string
  payerUserId?: string | null
  contactEmail?: string | null
  memberUserIds?: string[]
}

export interface UpdateHouseholdInput {
  organizationId: string
  householdId: string
  name?: string
  payerUserId?: string | null
  contactEmail?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  banned: boolean
  banReason: string | null
  banExpires: string | null
  emailVerified: boolean
  createdAt: string
}

export interface UserStats {
  level: {
    totalAces: number
    currentLevel: number
  }
  streak: {
    currentStreak: number
    longestStreak: number
    totalActiveWeeks: number
  }
  matches: {
    total: number
    wins: number
    losses: number
    winRate: number
    recent: {
      matchId: string
      status: string
      finishedAt: string | null
      scheduledAt: string | null
      isWinner: boolean
      side: string
    }[]
  }
  badges: {
    badgeId: string
    code: string
    category: string
    nameFr: string
    nameEn: string
    descriptionFr: string
    descriptionEn: string
    imageUrl: string
    unlockedAt: string
  }[]
  acesHistory: {
    date: string
    total: number
  }[]
  challenges: {
    active: ChallengeEntry[]
    completed: ChallengeEntry[]
  }
}

export interface ChallengeEntry {
  challengeId: string
  status: string
  currentProgress: number
  targetValue: number
  completedAt: string | null
  acesAwarded: number | null
  weekNumber: number
  year: number
  templateCode: string
  templateTitleFr: string
  templateTitleEn: string
  templateDifficulty: string
  templateType: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
  metadata: string | null
  memberCount: number
  address: string | null
  latitude: number | null
  longitude: number | null
  pin: string | null
  pinEnabled: boolean
}

export interface OrganizationMember {
  id: string
  role: string
  createdAt: string
  userId: string
  userName: string
  userEmail: string
  userImage: string | null
  userBanned: boolean | null
}

export interface ListOrganizationsParams {
  searchValue?: string
  limit?: number
  offset?: number
}

export interface ListOrganizationsResponse {
  organizations: Organization[]
  total: number
}

export interface ListOrganizationMembersParams {
  organizationId: string
  limit?: number
  offset?: number
}

export interface ListOrganizationMembersResponse {
  members: OrganizationMember[]
  total: number
}

export interface ListUsersParams {
  searchValue?: string
  searchField?: "email" | "name"
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterValue?: string
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

export interface ListUsersResponse {
  users: User[]
  total: number
}

export interface Invitation {
  id: string
  organizationId: string
  email: string
  role: string | null
  status: string
  expiresAt: string
  createdAt: string
  inviterId: string
  inviterName: string | null
  inviterEmail: string | null
}

export interface ListOrganizationInvitationsParams {
  organizationId: string
}

export interface ListOrganizationInvitationsResponse {
  invitations: Invitation[]
  total: number
}

export interface FeatureFlagOverride {
  id: string
  organizationId: string
  organizationName: string | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface FeatureFlag {
  id: string
  key: string
  enabled: boolean
  description: string | null
  createdAt: string
  updatedAt: string
  overrides: FeatureFlagOverride[]
}

export interface ListFeatureFlagsResponse {
  featureFlags: FeatureFlag[]
}

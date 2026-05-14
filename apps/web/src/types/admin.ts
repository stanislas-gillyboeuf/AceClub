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

export interface MatchParticipant {
  id: string
  matchId: string
  userId: string
  side: "home" | "away"
  isWinner: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  } | null
}

export interface MatchSetScore {
  participantId: string
  userId: string
  side: "home" | "away"
  games: number
}

export interface MatchSet {
  id: string
  matchId: string
  setNumber: number
  createdAt: string
  scores: MatchSetScore[]
}

export interface MatchComment {
  id: string
  matchId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    image: string | null
  } | null
}

export interface AdminMatch {
  id: string
  createdBy: string
  conversationId: string | null
  venueOrganizationId: string | null
  status: "scheduled" | "ongoing" | "finished"
  type: "match" | "training"
  createdAt: string
  scheduledAt: string | null
  startedAt: string | null
  finishedAt: string | null
  participants: MatchParticipant[]
  sets: MatchSet[]
  comments: MatchComment[]
}

export interface ListMatchesResponse {
  matches: AdminMatch[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AccountDeletionRequest {
  id: string
  email: string
  firstName: string
  lastName: string
  clubName: string
  reason: string | null
  status: "pending" | "processed" | "rejected"
  createdAt: string
  processedAt: string | null
  processedBy: string | null
}

export interface ListAccountDeletionRequestsResponse {
  requests: AccountDeletionRequest[]
}

export interface AdminEvent {
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
  visibility: "public" | "organization"
  status: "draft" | "presale" | "on_sale" | "completed" | "full" | "cancelled" | "archived"
  userId: string
  organizationId: string | null
  createdAt: string
  updatedAt: string
  participantCount: number
}

export interface ListEventsParams {
  status?: string
  organizationId?: string
  limit?: number
  offset?: number
}

export interface ListEventsResponse {
  events: AdminEvent[]
  total: number
}

// Game Config
export interface GameConfigEntry {
  id: string
  category: string
  key: string
  value: string
  description: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface GameConfigResponse {
  config: Record<string, GameConfigEntry[]>
}

// Challenge Templates
export interface ChallengeTemplate {
  id: string
  code: string
  type: "quantitative" | "social" | "performance"
  difficulty: "easy" | "medium" | "hard"
  titleFr: string
  titleEn: string
  descriptionFr: string
  descriptionEn: string
  targetValue: number
  acesReward: number
  minLevel: number
  maxLevel: number | null
  isActive: boolean
  createdAt: string
}

export interface ListChallengeTemplatesParams {
  type?: string
  difficulty?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface ListChallengeTemplatesResponse {
  templates: ChallengeTemplate[]
  total: number
  limit: number
  offset: number
}

// Badges
export interface AdminBadge {
  id: string
  code: string
  category: "level" | "achievement" | "milestone" | "special"
  nameFr: string
  nameEn: string
  descriptionFr: string
  descriptionEn: string
  imageUrl: string
  requiredLevel: number | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  unlockCount: number
}

export interface ListBadgesResponse {
  badges: AdminBadge[]
}

// Notifications admin
export type NotificationType =
  | "match_request_accepted"
  | "invitation_accepted"
  | "new_match_request"
  | "match_reminder"
  | "challenge_assigned"
  | "streak_warning"
  | "new_message"
  | "match_liked"

export interface NotificationTemplate {
  id: string
  type: NotificationType
  description: string
  availableVariables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationTemplateSummary extends NotificationTemplate {
  variantsCount: number
  activeVariantsCount: number
}

export interface NotificationTemplateVariant {
  id: string
  templateId: string
  title: string
  body: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ListNotificationTemplatesResponse {
  templates: NotificationTemplateSummary[]
}

export interface GetNotificationTemplateResponse {
  template: NotificationTemplate
  variants: NotificationTemplateVariant[]
}

export type NotificationAudience =
  | { type: "all" }
  | { type: "user_ids"; userIds: string[] }

export interface NotificationSchedule {
  id: string
  templateId: string
  templateType: NotificationType
  name: string
  cronExpression: string
  timezone: string
  audience: NotificationAudience
  defaultVariables: Record<string, string>
  isActive: boolean
  lastRunAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ListNotificationSchedulesResponse {
  schedules: NotificationSchedule[]
}

export interface SendTestNotificationResponse {
  success: boolean
  title: string
  body: string
  devicesNotified: number
  devicesFound: number
}

export interface MatchDetailResponse {
  match: Omit<AdminMatch, "participants" | "sets" | "comments">
  participants: MatchParticipant[]
  sets: MatchSet[]
  comments: MatchComment[]
  myFeedback: unknown
  venueOrganization: {
    id: string
    name: string
    slug: string
    logo: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
  } | null
  participantOrganizations: {
    userId: string
    organization: {
      id: string
      name: string
      slug: string
      logo: string | null
    }
  }[]
}

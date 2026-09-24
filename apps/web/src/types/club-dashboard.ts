export interface CoachBadge {
  userId: string
  name: string
  image: string | null
  coursesToday: number
}

export interface CourseToday {
  occurrenceId: string
  courseId: string | null
  courseName: string
  coachName: string
  courtName: string
  startAt: string
  endAt: string
}

export interface PendingCotisation {
  userId: string
  name: string
  seasonLabel: string
  amountCents: number
  dueDate: string
  isOverdue: boolean
}

export interface HomeCotisations {
  items: PendingCotisation[]
  totalRemainingCents: number
  overdueCount: number
}

export type MemberAlertType =
  | "license_expired"
  | "license_expiring"
  | "medical_expired"
  | "medical_expiring"
  | "dues_overdue"

export interface MemberAlert {
  userId: string
  userName: string
  userImage: string | null
  type: MemberAlertType
  detail: string
  seasonLabel?: string
}

export interface TopPlayer {
  userId: string
  name: string
  image: string | null
  bookingCount: number
}

export interface OccupancyDay {
  date: string
  label: string
  percent: number
}

export interface HomeBoardStats {
  adherentCount: number
  activeCourts: number
  occupancyPercent: number
}

export interface HomeBoard {
  stats: HomeBoardStats
  coachBadges: CoachBadge[]
  coursesToday: CourseToday[]
  cotisations: HomeCotisations
  alerts: MemberAlert[]
  topPlayers: TopPlayer[]
  occupancyByDay: OccupancyDay[]
}

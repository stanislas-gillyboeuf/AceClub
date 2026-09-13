export type MemberAlertType =
  | "license_expired"
  | "license_expiring"
  | "medical_expired"
  | "medical_expiring"
  | "dues_overdue"

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

export interface SlotToFill {
  courtId: string
  courtName: string
  date: string
  hour: number
}

export interface MemberAlert {
  userId: string
  userName: string
  userImage: string | null
  type: MemberAlertType
  detail: string
  assignmentId?: string
}

export interface NewMember {
  userId: string
  name: string
  image: string | null
  memberSince: string
  hasLicense: boolean
  hasBooked: boolean
}

export interface DueSoon {
  assignmentId: string
  userName: string
  duesTypeName: string
  amountCents: number
  dueDate: string | null
  status: string
}

export interface TopPlayer {
  userId: string
  name: string
  image: string | null
  bookingCount: number
}

export interface HomeBoardStats {
  activeMembers: number
  activeCourts: number
  occupancyPercent: number
}

export interface HomeBoard {
  stats: HomeBoardStats
  coachBadges: CoachBadge[]
  coursesToday: CourseToday[]
  slotsToFill: SlotToFill[]
  memberAlerts: MemberAlert[]
  newMembers: NewMember[]
  duesDueSoon: DueSoon[]
  topPlayers: TopPlayer[]
}

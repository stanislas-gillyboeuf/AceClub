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

export interface OccupancyDay {
  date: string
  label: string
  percent: number
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
  duesDueSoon: DueSoon[]
  topPlayers: TopPlayer[]
  occupancyByDay: OccupancyDay[]
}

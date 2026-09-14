export type CourseStatus = "active" | "cancelled"

export interface CourseListItem {
  id: string
  name: string
  weekday: number
  startTime: string
  durationMinutes: number
  startDate: string
  endDate: string
  status: CourseStatus
  coachUserId: string
  coachName: string
  coachImage: string | null
  courtName: string
}

export interface CourseOccurrence {
  id: string
  startAt: string
  endAt: string
  status: "confirmed" | "cancelled"
  kind: "member" | "admin_block" | "course"
  cancellationReason?: string | null
}

export interface CourseRosterMember {
  userId: string
  name: string
  email?: string
  image: string | null
}

export interface CourseDetail {
  course: {
    id: string
    organizationId: string
    name: string
    weekday: number
    startTime: string
    durationMinutes: number
    startDate: string
    endDate: string
    status: CourseStatus
    coachUserId: string
    coachName: string
    courtId: string
    courtName: string
  }
  roster: CourseRosterMember[]
  occurrences: CourseOccurrence[]
}

export interface MyCourseItem {
  id: string
  name: string
  weekday: number
  startTime: string
  durationMinutes: number
  startDate: string
  endDate: string
  status: CourseStatus
  courtName: string
  roster: CourseRosterMember[]
  occurrences: CourseOccurrence[]
}

export interface CreateCourseInput {
  organizationId: string
  coachUserId: string
  courtId: string
  name: string
  weekday: number
  startTime: string
  durationMinutes: number
  startDate: string
  endDate: string
}

export interface UpdateCourseInput {
  courseId: string
  coachUserId?: string
  courtId?: string
  name?: string
  weekday?: number
  startTime?: string
  durationMinutes?: number
  endDate?: string
}

export interface CancelOccurrenceInput {
  bookingId: string
  reason?: string
  reopen: boolean
}

export type AttendanceStatus = "present" | "absent"

export interface AttendanceRosterMember {
  userId: string
  name: string
  image: string | null
  status: AttendanceStatus | null
}

export interface OccurrenceAttendance {
  bookingId: string
  startAt: string
  roster: AttendanceRosterMember[]
}

export interface MarkAttendanceInput {
  bookingId: string
  userId: string
  status: AttendanceStatus
}

export interface NotifyStudentsInput {
  courseId: string
  userIds: string[]
  title?: string
  body: string
}

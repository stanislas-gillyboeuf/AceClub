export type DuesAssignmentStatus = "pending" | "paid" | "waived"

export interface DuesType {
  id: string
  organizationId: string
  name: string
  amountCents: number
  dueDate: string | null
  isActive: boolean
  createdAt: string
  summary: { pending: number; paid: number; waived: number }
}

export interface DuesAssignment {
  id: string
  duesTypeId: string
  status: DuesAssignmentStatus
  paidAt: string | null
  paidMethod: string | null
  notes: string | null
  userId: string
  userName: string
  userEmail: string
  userImage: string | null
  lastReminderAt: string | null
}

export interface ListAssignmentsParams {
  organizationId: string
  duesTypeId?: string
  status?: DuesAssignmentStatus
  search?: string
  limit?: number
  offset?: number
}

export interface ListAssignmentsResponse {
  assignments: DuesAssignment[]
  total: number
}

export interface MemberDuesHistoryItem {
  id: string
  status: DuesAssignmentStatus
  paidAt: string | null
  paidMethod: string | null
  duesTypeName: string
  amountCents: number
  dueDate: string | null
}

export interface CreateDuesTypeInput {
  organizationId: string
  name: string
  amountCents: number
  dueDate?: string | null
  isActive?: boolean
}

export interface UpdateDuesTypeInput {
  duesTypeId: string
  name?: string
  amountCents?: number
  dueDate?: string | null
  isActive?: boolean
}

export interface AssignDuesInput {
  organizationId: string
  duesTypeId: string
  userIds?: string[]
  allActiveMembers?: boolean
}

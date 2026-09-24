export type BroadcastChannel = "email" | "push" | "both"
export type BroadcastSegment = "all" | "unpaid_dues" | "inactive_30d"

export interface BroadcastMessage {
  id: string
  subject: string
  body: string
  channel: BroadcastChannel
  segment: BroadcastSegment
  recipientCount: number
  createdAt: string
  senderName: string
}

export interface ListBroadcastsResponse {
  broadcasts: BroadcastMessage[]
  total: number
}

export interface SegmentPreviewMember {
  userId: string
  name: string
  email: string | null
  image: string | null
}

export interface SegmentPreview {
  count: number
  /** Distinct addresses an email announcement will actually reach (shared contacts count once). */
  emailAddressCount: number
  /** Members with no usable contact address: they will not receive the email. */
  emailNoContactCount: number
  sample: SegmentPreviewMember[]
}

export interface SendBroadcastInput {
  organizationId: string
  subject: string
  body: string
  channel: BroadcastChannel
  segment: BroadcastSegment
}

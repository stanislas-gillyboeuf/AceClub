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
  email: string
  image: string | null
}

export interface SegmentPreview {
  count: number
  sample: SegmentPreviewMember[]
}

export interface SendBroadcastInput {
  organizationId: string
  subject: string
  body: string
  channel: BroadcastChannel
  segment: BroadcastSegment
}

export interface SubscriptionType {
  id: string
  organizationId: string
  name: string
  priceCents: number | null
  durationDays: number | null
  isActive: boolean
  createdAt: string
}

export interface MemberSubscriptionSummary {
  id: string
  startDate: string
  endDate: string | null
  amountDueCents: number
  status: "active" | "cancelled"
  typeName: string
  typePriceCents: number | null
}

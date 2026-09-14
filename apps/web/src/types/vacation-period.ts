export interface VacationPeriod {
  id: string
  organizationId: string
  name: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface CreateVacationPeriodInput {
  organizationId: string
  name: string
  startDate: string
  endDate: string
}

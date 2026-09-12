export interface OccupancyWeekPoint {
  weekLabel: string
  percent: number
}

export interface DashboardSummary {
  activeMembers: number
  activeCourtsCount: number
  occupancy: {
    currentWeekPercent: number
    previousWeekPercent: number
    deltaPercentPoints: number
    weeklyTrend: OccupancyWeekPoint[]
  }
}

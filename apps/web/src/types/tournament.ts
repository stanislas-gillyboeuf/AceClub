export type TournamentStatus = "draft" | "in_progress" | "completed"
export type TournamentMatchStatus = "pending" | "ready" | "bye" | "completed"
export type TournamentSport = "tennis" | "padel"

export interface TournamentListItem {
  id: string
  eventId: string
  sport: TournamentSport
  format: "single_elimination"
  drawSize: number
  status: TournamentStatus
  eventName: string
  eventStartDate: string
}

export interface TournamentSeedRow {
  userId: string
  seedNumber: number
  skillLevel: string | null
  name: string
  image: string | null
}

export interface TournamentMatchRow {
  id: string
  round: number
  position: number
  status: TournamentMatchStatus
  player1UserId: string | null
  player2UserId: string | null
  winnerUserId: string | null
  player1Name: string | null
  player2Name: string | null
  winnerName: string | null
}

export interface TournamentDetail {
  id: string
  eventId: string
  organizationId: string
  sport: TournamentSport
  format: "single_elimination"
  drawSize: number
  status: TournamentStatus
  eventName: string
  eventDescription: string | null
  eventStartDate: string
  eventEndDate: string
  eventStatus: string
  seeds: TournamentSeedRow[]
  matches: TournamentMatchRow[]
}

export interface CreateTournamentInput {
  organizationId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  address?: string
  maxParticipants?: number
  isFree?: boolean
  price?: number
  paymentLink?: string
  visibility?: "public" | "organization"
  sport: TournamentSport
  drawSize: number
}

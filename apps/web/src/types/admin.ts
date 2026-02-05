export interface User {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  banned: boolean
  banReason: string | null
  banExpires: string | null
  emailVerified: boolean
  createdAt: string
}

export interface UserStats {
  level: {
    totalAces: number
    currentLevel: number
  }
  streak: {
    currentStreak: number
    longestStreak: number
    totalActiveWeeks: number
  }
  matches: {
    total: number
    wins: number
    losses: number
    winRate: number
    recent: {
      matchId: string
      status: string
      finishedAt: string | null
      scheduledAt: string | null
      isWinner: boolean
      side: string
    }[]
  }
  badges: {
    badgeId: string
    code: string
    category: string
    nameFr: string
    nameEn: string
    descriptionFr: string
    descriptionEn: string
    imageUrl: string
    unlockedAt: string
  }[]
  acesHistory: {
    date: string
    total: number
  }[]
  challenges: {
    active: ChallengeEntry[]
    completed: ChallengeEntry[]
  }
}

export interface ChallengeEntry {
  challengeId: string
  status: string
  currentProgress: number
  targetValue: number
  completedAt: string | null
  acesAwarded: number | null
  weekNumber: number
  year: number
  templateCode: string
  templateTitleFr: string
  templateTitleEn: string
  templateDifficulty: string
  templateType: string
}

export interface ListUsersParams {
  searchValue?: string
  searchField?: "email" | "name"
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterValue?: string
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

export interface ListUsersResponse {
  users: User[]
  total: number
}

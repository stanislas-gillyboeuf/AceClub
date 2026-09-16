export type LevelSport = "tennis" | "padel"

export interface ClubLevelCategory {
  id: string
  name: string
  sortOrder: number
}

export interface ListCategoriesResponse {
  builtin: readonly string[]
  custom: ClubLevelCategory[]
}

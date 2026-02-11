export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  totalActiveWeeks: number;
  streakStartDate: string | null;
}

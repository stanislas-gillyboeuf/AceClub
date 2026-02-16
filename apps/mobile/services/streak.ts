import { api } from "@/lib/api";
import type { UserStreak } from "@/types/streak";

export const streakService = {
  getMyStreak: () =>
    api.get<UserStreak>("/streak/me"),
};

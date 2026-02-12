import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Level,
  Streak,
  Badge,
  Challenge,
  AcesHistoryEntry,
  LeaderboardResponse,
} from "@/types/gamification";

export function useMyLevel() {
  return useQuery({
    queryKey: ["level", "me"],
    queryFn: () => apiClient<Level>("/level/me"),
  });
}

export function useMyStreak() {
  return useQuery({
    queryKey: ["streak", "me"],
    queryFn: () => apiClient<Streak>("/streak/me"),
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: ["badges", "me"],
    queryFn: () => apiClient<{ badges: Badge[] }>("/reward/badges"),
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["badges", "all"],
    queryFn: () => apiClient<{ badges: Badge[] }>("/reward/badges/all"),
  });
}

export function useMyChallenges() {
  return useQuery({
    queryKey: ["challenges", "me"],
    queryFn: () => apiClient<{ active: Challenge[]; completed: Challenge[] }>("/challenge"),
  });
}

export function useAcesHistory() {
  return useQuery({
    queryKey: ["level", "history"],
    queryFn: () => apiClient<AcesHistoryEntry[]>("/level/history"),
  });
}

export function useGlobalLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => apiClient<LeaderboardResponse>("/leaderboard/global"),
  });
}

export function useWeeklyLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "weekly"],
    queryFn: () => apiClient<LeaderboardResponse>("/leaderboard/weekly"),
  });
}

export function useOrganizationLeaderboard(orgId: string | undefined) {
  return useQuery({
    queryKey: ["leaderboard", "organization", orgId],
    queryFn: () => apiClient<LeaderboardResponse>(`/leaderboard/organization/${orgId}`),
    enabled: !!orgId,
  });
}

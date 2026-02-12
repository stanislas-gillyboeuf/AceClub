import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User, UserPreferences, SearchUser } from "@/types/user";

export function useMe() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiClient<User>("/user/me"),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ["user", "preferences"],
    queryFn: () => apiClient<UserPreferences>("/user/preferences"),
  });
}

export function useSearchUsers(query: string, limit = 10) {
  return useQuery({
    queryKey: ["user", "search", query, limit],
    queryFn: () =>
      apiClient<{ users: SearchUser[]; count: number }>(
        `/user/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      ),
    enabled: query.length >= 1,
  });
}

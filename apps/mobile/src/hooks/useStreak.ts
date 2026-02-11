import { useQuery } from "@tanstack/react-query";
import { streakApi } from "@/api/endpoints/streak";

export function useMyStreak() {
  return useQuery({
    queryKey: ["streak", "me"],
    queryFn: () => streakApi.getMyStreak(),
  });
}

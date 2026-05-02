import { useQuery } from "@tanstack/react-query";
import { streakService } from "@/services/streak";
import { queryKeys } from "@/lib/query-keys";

export function useMyStreak() {
  return useQuery({
    queryKey: queryKeys.streak.me(),
    queryFn: streakService.getMyStreak,
  });
}

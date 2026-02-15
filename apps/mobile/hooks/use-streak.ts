import { useQuery } from "@tanstack/react-query";
import { streakService } from "@/services/streak";

export function useMyStreak() {
  return useQuery({
    queryKey: ["streak", "me"],
    queryFn: streakService.getMyStreak,
  });
}

import { useQuery } from "@tanstack/react-query";
import { levelService } from "@/services/level";

export function useMyLevel() {
  return useQuery({
    queryKey: ["level", "me"],
    queryFn: levelService.getMyLevel,
  });
}

export function useUserLevel(userId: string) {
  return useQuery({
    queryKey: ["level", userId],
    queryFn: () => levelService.getUserLevel(userId),
    enabled: !!userId,
  });
}

export function useAcesHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["level", "aces-history", page, limit],
    queryFn: () => levelService.getAcesHistory(page, limit),
  });
}

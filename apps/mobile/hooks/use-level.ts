import { useQuery } from "@tanstack/react-query";
import { levelService } from "@/services/level";
import { queryKeys } from "@/lib/query-keys";

export function useMyLevel() {
  return useQuery({
    queryKey: queryKeys.level.me(),
    queryFn: levelService.getMyLevel,
  });
}

export function useUserLevel(userId: string) {
  return useQuery({
    queryKey: queryKeys.level.user(userId),
    queryFn: () => levelService.getUserLevel(userId),
    enabled: !!userId,
  });
}

export function useAcesHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.level.acesHistory(page, limit),
    queryFn: () => levelService.getAcesHistory(page, limit),
  });
}

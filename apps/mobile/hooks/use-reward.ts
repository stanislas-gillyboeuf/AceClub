import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardService } from "@/services/reward";
import { queryKeys } from "@/lib/query-keys";

const alwaysFresh = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: "always",
} as const;

export function useMyBadges() {
  return useQuery({
    queryKey: queryKeys.reward.myBadges(),
    queryFn: rewardService.getMyBadges,
    ...alwaysFresh,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: queryKeys.reward.allBadges(),
    queryFn: rewardService.getAllBadges,
    ...alwaysFresh,
  });
}

export function useMyTitles() {
  return useQuery({
    queryKey: queryKeys.reward.myTitles(),
    queryFn: rewardService.getMyTitles,
    ...alwaysFresh,
  });
}

export function useEquipTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (titleId: string) => rewardService.equipTitle(titleId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reward.myTitles() });
    },
  });
}

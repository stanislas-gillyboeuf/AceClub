import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardService } from "@/services/reward";
import { queryKeys } from "@/lib/query-keys";

export function useMyBadges() {
  return useQuery({
    queryKey: queryKeys.reward.myBadges(),
    queryFn: rewardService.getMyBadges,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: queryKeys.reward.allBadges(),
    queryFn: rewardService.getAllBadges,
  });
}

export function useMyTitles() {
  return useQuery({
    queryKey: queryKeys.reward.myTitles(),
    queryFn: rewardService.getMyTitles,
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardService } from "@/services/reward";
import { queryKeys } from "@/lib/query-keys";

export function useMyBadges() {
  return useQuery({
    queryKey: queryKeys.reward.myBadges(),
    queryFn: rewardService.getMyBadges,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: queryKeys.reward.allBadges(),
    queryFn: rewardService.getAllBadges,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
}

export function useMyTitles() {
  return useQuery({
    queryKey: queryKeys.reward.myTitles(),
    queryFn: rewardService.getMyTitles,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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

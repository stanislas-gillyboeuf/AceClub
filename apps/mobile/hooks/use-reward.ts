import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardService } from "@/services/reward";

export function useMyBadges() {
  return useQuery({
    queryKey: ["reward", "my-badges"],
    queryFn: rewardService.getMyBadges,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["reward", "all-badges"],
    queryFn: rewardService.getAllBadges,
  });
}

export function useMyTitles() {
  return useQuery({
    queryKey: ["reward", "my-titles"],
    queryFn: rewardService.getMyTitles,
  });
}

export function useEquipTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (titleId: string) => rewardService.equipTitle(titleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward", "my-titles"] });
    },
  });
}

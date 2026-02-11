import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rewardApi } from "@/api/endpoints/reward";

export function useMyBadges() {
  return useQuery({
    queryKey: ["rewards", "badges"],
    queryFn: () => rewardApi.getMyBadges().then((res) => res.badges),
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["rewards", "badges", "all"],
    queryFn: () => rewardApi.getAllBadges().then((res) => res.badges),
  });
}

export function useTitles() {
  return useQuery({
    queryKey: ["rewards", "titles"],
    queryFn: () => rewardApi.getTitles(),
  });
}

export function useEquipTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titleId: string) => rewardApi.equipTitle(titleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", "titles"] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { challengeApi } from "@/api/endpoints/challenge";

export function useActiveChallenges() {
  return useQuery({
    queryKey: ["challenges", "active"],
    queryFn: () => challengeApi.getMyChallenges().then((res) => res.challenges),
  });
}

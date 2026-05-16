import { useQuery } from "@tanstack/react-query";
import { challengeService } from "@/services/challenge";
import { queryKeys } from "@/lib/query-keys";

const alwaysFresh = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: "always",
} as const;

export function useMyChallenges() {
  return useQuery({
    queryKey: queryKeys.challenge.me(),
    queryFn: challengeService.getMyChallenges,
    ...alwaysFresh,
  });
}

export function useChallengeTemplates() {
  return useQuery({
    queryKey: queryKeys.challenge.templates(),
    queryFn: challengeService.getChallengeTemplates,
    ...alwaysFresh,
  });
}

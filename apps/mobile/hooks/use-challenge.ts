import { useQuery } from "@tanstack/react-query";
import { challengeService } from "@/services/challenge";
import { queryKeys } from "@/lib/query-keys";

export function useMyChallenges() {
  return useQuery({
    queryKey: queryKeys.challenge.me(),
    queryFn: challengeService.getMyChallenges,
  });
}

export function useChallengeTemplates() {
  return useQuery({
    queryKey: queryKeys.challenge.templates(),
    queryFn: challengeService.getChallengeTemplates,
  });
}

import { useQuery } from "@tanstack/react-query";
import { challengeService } from "@/services/challenge";

export function useMyChallenges() {
  return useQuery({
    queryKey: ["challenge", "me"],
    queryFn: challengeService.getMyChallenges,
  });
}

export function useChallengeTemplates() {
  return useQuery({
    queryKey: ["challenge", "templates"],
    queryFn: challengeService.getChallengeTemplates,
  });
}

import { api } from "@/lib/api";
import type { ChallengesResponse, ChallengeTemplate } from "@/types/challenge";

export const challengeService = {
  getMyChallenges: () =>
    api.get<ChallengesResponse>("/challenge/me"),

  getChallengeTemplates: () =>
    api.get<ChallengeTemplate[]>("/challenge/templates"),
};

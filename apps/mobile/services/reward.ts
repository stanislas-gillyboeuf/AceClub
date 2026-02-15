import { api } from "@/lib/api";
import type { MyBadgesResponse, AllBadgesResponse, TitlesResponse, EquipTitleResponse } from "@/types/reward";

export const rewardService = {
  getMyBadges: () =>
    api.get<MyBadgesResponse>("/reward/my-badges"),

  getAllBadges: () =>
    api.get<AllBadgesResponse>("/reward/all-badges"),

  getMyTitles: () =>
    api.get<TitlesResponse>("/reward/my-titles"),

  equipTitle: (titleId: string) =>
    api.post<EquipTitleResponse>("/reward/equip-title", { titleId }),
};

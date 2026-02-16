import { api } from "@/lib/api";
import type { MyBadgesResponse, AllBadgesResponse, TitlesResponse, EquipTitleResponse } from "@/types/reward";

export const rewardService = {
  getMyBadges: () =>
    api.get<MyBadgesResponse>("/reward/badges"),

  getAllBadges: () =>
    api.get<AllBadgesResponse>("/reward/badges/all"),

  getMyTitles: () =>
    api.get<TitlesResponse>("/reward/titles"),

  equipTitle: (titleId: string) =>
    api.put<EquipTitleResponse>("/reward/titles/equip", { titleId }),
};

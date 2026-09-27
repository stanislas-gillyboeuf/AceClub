import { api } from "@/lib/api";
import type { UserLevel, AcesHistoryResponse } from "@/types/level";

export const levelService = {
  getMyLevel: () =>
    api.get<UserLevel>("/level/me"),

  getUserLevel: (userId: string) =>
    api.get<UserLevel>(`/level/user/${userId}`),

  getAcesHistory: (page = 1, limit = 20) =>
    api.get<AcesHistoryResponse>("/level/history", { page, limit }),
};

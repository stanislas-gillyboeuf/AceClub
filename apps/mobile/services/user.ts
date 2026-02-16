import { api } from "@/lib/api";
import type { User, UserSearchResponse, UserPreferences, CompleteOnboardingRequest, UpdateProfileRequest, CreateGhostRequest, GhostUser } from "@/types/user";

export const userService = {
  getMe: () =>
    api.get<User>("/user/me"),

  searchUsers: (query: string, limit = 10) =>
    api.get<UserSearchResponse>("/user/search", { query, limit }),

  completeOnboarding: (data: CompleteOnboardingRequest) =>
    api.post<User>("/user/complete-onboarding", data),

  getPreferences: () =>
    api.get<UserPreferences>("/user/preferences"),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<User>("/user/profile", data),

  createGhost: (data: CreateGhostRequest) =>
    api.post<GhostUser>("/user/ghost", data),
};

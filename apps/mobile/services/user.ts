import { api } from "@/lib/api";
import type {
  User,
  UserSearchResponse,
  UserPreferences,
  CompleteOnboardingRequest,
  UpdateProfileRequest,
  CreateGhostRequest,
  GhostUser,
  BlockedUser,
  PastPartner,
  MinimalProfile,
  ProfileShareTokenResponse,
  ImportedProfile,
} from "@/types/user";

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

  blockUser: (userId: string) =>
    api.post<{ blockerUserId: string; blockedUserId: string }>("/user/block", { userId }),

  unblockUser: (userId: string) =>
    api.post<{ success: boolean }>("/user/unblock", { userId }),

  listBlocked: () =>
    api.get<{ users: BlockedUser[] }>("/user/blocked"),

  reportUser: (userId: string, reason: string, context?: string) =>
    api.post<{ id: string }>("/user/report", { userId, reason, context }),

  createProfileShareToken: () =>
    api.post<ProfileShareTokenResponse>("/user/profile-share-token/create"),

  revokeProfileShareToken: (token: string) =>
    api.post<{ success: boolean }>("/user/profile-share-token/revoke", { token }),

  getProfileByToken: (token: string) =>
    api.get<MinimalProfile>("/user/profile-by-token", { token }),

  listPastPartners: () =>
    api.get<{ partners: PastPartner[] }>("/user/past-partners"),

  findImportedProfiles: () =>
    api.get<{ profiles: ImportedProfile[] }>("/user/find-imported-profiles"),

  claimProfile: (ghostUserId: string, organizationId: string) =>
    api.post<{ success: boolean; organizationId: string }>("/user/claim-profile", {
      ghostUserId,
      organizationId,
    }),
};

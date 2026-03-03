import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { api } from "@/lib/api";
import type { CompleteOnboardingRequest, UpdateProfileRequest, CreateGhostRequest } from "@/types/user";

export function useMe() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: userService.getMe,
  });
}

export function useSearchUsers(query: string, limit = 10) {
  return useQuery({
    queryKey: ["user", "search", query, limit],
    queryFn: () => userService.searchUsers(query, limit),
    enabled: query.length >= 2,
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ["user", "preferences"],
    queryFn: userService.getPreferences,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteOnboardingRequest) => userService.completeOnboarding(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useCreateGhost() {
  return useMutation({
    mutationFn: (data: CreateGhostRequest) => userService.createGhost(data),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      return api.delete<void>("/user/me");
    },
  });
}

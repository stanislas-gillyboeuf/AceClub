import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/endpoints/user";
import { useAuthStore } from "@/stores/auth";
import type { UpdateProfileData } from "@/types/user";

export function usePreferences() {
  return useQuery({
    queryKey: ["user", "preferences"],
    queryFn: () => userApi.getPreferences(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sport: string;
      skillLevel: string;
      organizationId: string;
      phoneNumber: string;
      imageUrl?: string;
      pin?: string;
    }) => userApi.completeOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useSearchUsers() {
  return useMutation({
    mutationFn: (query: string) =>
      userApi.searchUsers(query).then((res) => res.users),
  });
}

export function useCreateGhost() {
  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      userApi.createGhost(data),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User, CompleteOnboardingData, UpdateProfileData } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteOnboardingData) =>
      apiClient<User>("/user/complete-onboarding", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      apiClient<User>("/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

export function useUploadUserImage() {
  return useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`${API_URL}/api/upload/user-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `API error: ${res.status}`);
      }

      return res.json() as Promise<{ imageUrl: string }>;
    },
  });
}

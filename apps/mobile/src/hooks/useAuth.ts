import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/endpoints/auth";
import { userApi } from "@/api/endpoints/user";
import { useAuthStore } from "@/stores/auth";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userApi.getMe(),
    enabled: isAuthenticated,
  });
}

export function useSignInWithGoogle() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (idToken: string) => authApi.signInWithGoogle(idToken),
    onSuccess: async (data) => {
      await setAuth(data.token, data.user as any);
    },
  });
}

export function useSignInWithApple() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: {
      idToken: string;
      user?: { name?: { firstName?: string; lastName?: string } };
    }) => authApi.signInWithApple(payload),
    onSuccess: async (data) => {
      await setAuth(data.token, data.user as any);
    },
  });
}

export function useSignOut() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: async () => {
      await logout();
      queryClient.clear();
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/endpoints/admin";
import type { AdminListUsersParams } from "@/api/endpoints/admin";

export function useAdminUsers(params?: AdminListUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminUserSessions(userId: string) {
  return useQuery({
    queryKey: ["admin", "sessions", userId],
    queryFn: () => adminApi.listUserSessions(userId),
    enabled: !!userId,
  });
}

export function useAdminUserStats(userId: string) {
  return useQuery({
    queryKey: ["admin", "user-stats", userId],
    queryFn: () => adminApi.getUserStats(userId),
    enabled: !!userId,
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.setRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      banReason,
    }: {
      userId: string;
      banReason?: string;
    }) => adminApi.banUser(userId, banReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.revokeUserSessions(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "sessions", userId],
      });
    },
  });
}

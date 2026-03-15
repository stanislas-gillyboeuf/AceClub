import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import type { BanUserRequest, CreateUserRequest, SetRoleRequest } from "@/types/admin";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminService.listUsers,
  });
}

export function useAdminUserSessions(userId: string) {
  return useQuery({
    queryKey: ["admin", "sessions", userId],
    queryFn: () => adminService.listUserSessions(userId),
    enabled: !!userId,
  });
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      adminService.revokeUserSession(data),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions", variables.userId] });
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.revokeUserSessions(userId),
    onSettled: (_data, _err, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions", userId] });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BanUserRequest) => adminService.banUser(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => adminService.createUser(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useSetRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SetRoleRequest) => adminService.setRole(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useSetUserPassword() {
  return useMutation({
    mutationFn: (data: { userId: string; password: string }) =>
      adminService.setUserPassword(data),
  });
}

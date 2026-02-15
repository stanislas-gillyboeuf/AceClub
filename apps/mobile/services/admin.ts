import { api } from "@/lib/api";
import type { ListUsersResponse, UserSession, BanUserRequest, CreateUserRequest, SetRoleRequest } from "@/types/admin";
import type { User } from "@/types/user";

export const adminService = {
  listUsers: () =>
    api.get<ListUsersResponse>("/admin/list-users"),

  listUserSessions: (userId: string) =>
    api.get<UserSession[]>("/admin/list-user-sessions", { userId }),

  revokeUserSession: (data: { userId: string; sessionId: string }) =>
    api.post<void>("/admin/revoke-user-session", data),

  revokeUserSessions: (userId: string) =>
    api.post<void>("/admin/revoke-user-sessions", { userId }),

  banUser: (data: BanUserRequest) =>
    api.post<User>("/admin/ban-user", data),

  unbanUser: (userId: string) =>
    api.post<User>("/admin/unban-user", { userId }),

  createUser: (data: CreateUserRequest) =>
    api.post<User>("/admin/create-user", data),

  setRole: (data: SetRoleRequest) =>
    api.post<void>("/admin/set-role", data),

  setUserPassword: (data: { userId: string; password: string }) =>
    api.post<void>("/admin/set-user-password", data),
};

import type { User } from "./user";

export interface ListUsersResponse {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface BanUserRequest {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface SetRoleRequest {
  userId: string;
  role: string;
}

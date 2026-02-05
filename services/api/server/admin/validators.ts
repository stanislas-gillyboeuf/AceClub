import { z } from "zod";

export const listUsersValidator = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  filterField: z.string().optional(),
  filterValue: z.string().optional(),
  filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
});

export const updateUserValidator = z.object({
  userId: z.string(),
  data: z.record(z.string(), z.any()),
});

export const banUserValidator = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(),
});

export const unbanUserValidator = z.object({
  userId: z.string(),
});

export const listUserSessionsValidator = z.object({
  userId: z.string(),
});

export const revokeUserSessionValidator = z.object({
  sessionToken: z.string(),
});

export const revokeUserSessionsValidator = z.object({
  userId: z.string(),
});

export const createUserValidator = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: z.string().or(z.array(z.string())).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const setRoleValidator = z.object({
  userId: z.string(),
  role: z.string().or(z.array(z.string())),
});

export const setUserPasswordValidator = z.object({
  newPassword: z.string().min(8),
  userId: z.string(),
});

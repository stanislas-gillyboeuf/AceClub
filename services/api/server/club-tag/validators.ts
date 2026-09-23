import { z } from "zod";

export const listTagsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const createTagValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required").max(50),
});

export const deleteTagValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  tagId: z.string().min(1, "Tag ID is required"),
});

export const listMemberTagsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const setMemberTagsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  tagIds: z.array(z.string().min(1)),
});

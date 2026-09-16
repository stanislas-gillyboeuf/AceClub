import { z } from "zod";

const sportEnum = z.enum(["tennis", "padel"]);

export const listCategoriesValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  sport: sportEnum,
});

export const createCategoryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  sport: sportEnum,
  name: z.string().min(1, "Name is required").max(50),
});

export const deleteCategoryValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const setMemberLevelValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  sport: sportEnum,
  skillLevel: z.string().min(1, "Skill level is required"),
  verified: z.boolean(),
});

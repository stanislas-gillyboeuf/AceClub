import { z } from "zod";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const uploadUserImageValidator = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({ message: "Content type must be image/jpeg, image/png, or image/webp" }),
  }),
});

export const uploadOrgLogoValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({ message: "Content type must be image/jpeg, image/png, or image/webp" }),
  }),
});

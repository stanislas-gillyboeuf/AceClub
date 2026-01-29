import { z } from "zod";

export const searchUsersValidator = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

const TENNIS_LEVELS = [
  "Négatif",
  "-4/6",
  "-2/6",
  "0",
  "1/6",
  "2/6",
  "3/6",
  "4/6",
  "5/6",
  "15",
  "15/1",
  "15/2",
  "15/3",
  "15/4",
  "15/5",
  "30",
  "30/1",
  "30/2",
  "30/3",
  "30/4",
  "30/5",
  "40",
  "NC",
] as const;

const PADEL_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

export const completeOnboardingValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    sport: z.enum(["tennis", "padel"]),
    skillLevel: z.string().min(1, "Skill level is required"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .refine((value) => value.replace(/\D/g, "").length >= 8, {
        message: "Invalid phone number",
      }),
  })
  .refine(
    (data) => {
      if (data.sport === "tennis")
        return (TENNIS_LEVELS as readonly string[]).includes(data.skillLevel);
      return (PADEL_LEVELS as readonly string[]).includes(data.skillLevel);
    },
    { message: "Invalid skill level for the selected sport", path: ["skillLevel"] },
  );

export const updateProfileValidator = z
  .object({
    name: z.string().min(1, "Name must not be empty").optional(),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, "").length >= 8, {
        message: "Invalid phone number",
      })
      .optional(),
    organizationId: z.string().min(1, "Organization ID must not be empty").optional(),
    sport: z.enum(["tennis", "padel"]).optional(),
    skillLevel: z.string().min(1, "Skill level must not be empty").optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.name !== undefined ||
        data.phoneNumber !== undefined ||
        data.organizationId !== undefined ||
        data.sport !== undefined ||
        data.skillLevel !== undefined
      );
    },
    { message: "At least one field must be provided" },
  )
  .refine(
    (data) => {
      // If skillLevel is provided, validate it against the sport (if sport is also provided)
      if (data.skillLevel && data.sport) {
        if (data.sport === "tennis")
          return (TENNIS_LEVELS as readonly string[]).includes(data.skillLevel);
        return (PADEL_LEVELS as readonly string[]).includes(data.skillLevel);
      }
      return true;
    },
    { message: "Invalid skill level for the selected sport", path: ["skillLevel"] },
  );

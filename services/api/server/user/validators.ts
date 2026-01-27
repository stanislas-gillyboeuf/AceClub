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
  })
  .refine((data) => {
    if (data.sport === "tennis") return (TENNIS_LEVELS as readonly string[]).includes(data.skillLevel);
    return (PADEL_LEVELS as readonly string[]).includes(data.skillLevel);
  }, { message: "Invalid skill level for the selected sport", path: ["skillLevel"] });

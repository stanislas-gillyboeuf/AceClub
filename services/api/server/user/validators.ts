import { z } from "zod";

function isValidAge(val: string): boolean {
  const date = new Date(val);
  if (isNaN(date.getTime())) return false;
  // Reject dates where JS overflows the day (e.g. 2023-02-30 → March 2)
  if (date.getMonth() !== parseInt(val.split("-")[1], 10) - 1) return false;
  const today = new Date();
  const birthdayPassedThisYear =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  const age = today.getFullYear() - date.getFullYear() - (birthdayPassedThisYear ? 0 : 1);
  return age >= 13 && age <= 100;
}

const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
  .refine(isValidAge, "Age must be between 13 and 100 years");

export const createGhostValidator = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
});

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

const PADEL_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
// Accepted alongside PADEL_LEVELS so clients still on an older build (pre-numeric-scale)
// don't get rejected while they update — old accounts may also still carry these values.
const LEGACY_PADEL_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

function isValidSkillLevel(sport: "tennis" | "padel", skillLevel: string): boolean {
  if (sport === "tennis") return (TENNIS_LEVELS as readonly string[]).includes(skillLevel);
  return (
    (PADEL_LEVELS as readonly string[]).includes(skillLevel) ||
    (LEGACY_PADEL_LEVELS as readonly string[]).includes(skillLevel)
  );
}

export const completeOnboardingValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    sport: z.enum(["tennis", "padel"]),
    skillLevel: z.string().min(1, "Skill level is required"),
    // A player who practices both sports can declare a second one, with its own level.
    secondarySport: z.enum(["tennis", "padel"]).optional(),
    secondarySkillLevel: z.string().min(1).optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    gender: z.enum(["male", "female", "other"]),
    dateOfBirth: dateOfBirthSchema,
    imageUrl: z.string().url("Image must be a valid URL").optional(),
    pin: z.string().length(4).optional(),
  })
  .refine((data) => isValidSkillLevel(data.sport, data.skillLevel), {
    message: "Invalid skill level for the selected sport",
    path: ["skillLevel"],
  })
  .refine((data) => !data.secondarySport || data.secondarySport !== data.sport, {
    message: "secondarySport must be different from sport",
    path: ["secondarySport"],
  })
  .refine((data) => !data.secondarySport || !!data.secondarySkillLevel, {
    message: "secondarySkillLevel is required when secondarySport is set",
    path: ["secondarySkillLevel"],
  })
  .refine(
    (data) =>
      !data.secondarySport ||
      !data.secondarySkillLevel ||
      isValidSkillLevel(data.secondarySport, data.secondarySkillLevel),
    { message: "Invalid skill level for the selected secondary sport", path: ["secondarySkillLevel"] },
  );

export const updateProfileValidator = z
  .object({
    name: z.string().min(1, "Name must not be empty").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
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
    // A player who practices both sports can declare a second one, with its own level.
    // secondarySport: null clears it (a player who no longer plays the second sport).
    secondarySport: z.enum(["tennis", "padel"]).nullable().optional(),
    secondarySkillLevel: z.string().min(1).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dateOfBirth: dateOfBirthSchema.optional(),
    pin: z.string().length(4).optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.name !== undefined ||
        data.image !== undefined ||
        data.phoneNumber !== undefined ||
        data.organizationId !== undefined ||
        data.sport !== undefined ||
        data.skillLevel !== undefined ||
        data.secondarySport !== undefined ||
        data.secondarySkillLevel !== undefined ||
        data.gender !== undefined ||
        data.dateOfBirth !== undefined
      );
    },
    { message: "At least one field must be provided" },
  )
  .refine(
    (data) => {
      // If skillLevel is provided, validate it against the sport (if sport is also provided)
      if (data.skillLevel && data.sport) return isValidSkillLevel(data.sport, data.skillLevel);
      return true;
    },
    { message: "Invalid skill level for the selected sport", path: ["skillLevel"] },
  )
  .refine((data) => !data.secondarySport || !data.sport || data.secondarySport !== data.sport, {
    message: "secondarySport must be different from sport",
    path: ["secondarySport"],
  })
  .refine(
    (data) => {
      if (data.secondarySkillLevel && data.secondarySport) {
        return isValidSkillLevel(data.secondarySport, data.secondarySkillLevel);
      }
      return true;
    },
    { message: "Invalid skill level for the selected secondary sport", path: ["secondarySkillLevel"] },
  );

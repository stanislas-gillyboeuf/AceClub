import { z } from "zod";

// Score validation: aucune restriction stricte, juste un nombre positif raisonnable
const scoreSchema = z.number().int().min(0).max(100);

const participantSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  side: z.enum(["home", "away"], {
    message: "Side must be either 'home' or 'away'",
  }),
  isWinner: z.boolean().optional().default(false),
});

const setScoreSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  score: scoreSchema,
});

const setSchema = z.object({
  setNumber: z
    .number()
    .int()
    .min(1, "Set number must be at least 1")
    .max(5, "Set number cannot exceed 5"),
  scores: z.array(setScoreSchema).length(2, "Each set must have exactly 2 scores"),
});

export const createMatchValidator = z
  .object({
    createdBy: z.string().min(1, "Creator ID is required"),
    status: z.enum(["scheduled", "ongoing", "finished"], {
      message: "Status must be 'scheduled', 'ongoing', or 'finished'",
    }),
    type: z
      .enum(["match", "training"], {
        message: "Type must be 'match' or 'training'",
      })
      .optional()
      .default("match"),
    createdAt: z.string().datetime("Invalid datetime format for createdAt"),
    scheduledAt: z.string().datetime("Invalid datetime format for scheduledAt").optional(),
    startedAt: z.string().datetime("Invalid datetime format for startedAt").optional(),
    finishedAt: z.string().datetime("Invalid datetime format for finishedAt").optional(),
    participants: z
      .array(participantSchema)
      .min(2, "Must have at least 2 participants")
      .max(2, "Cannot have more than 2 participants"),
    sets: z.array(setSchema).max(5, "Cannot have more than 5 sets").optional().default([]),
  })
  .refine(
    (data) => {
      // Validate unique user IDs
      const userIds = data.participants.map((p) => p.userId);
      return new Set(userIds).size === userIds.length;
    },
    {
      message: "Participants must have unique user IDs",
      path: ["participants"],
    },
  )
  .refine(
    (data) => {
      // Validate one home and one away
      const sides = data.participants.map((p) => p.side);
      return sides.includes("home") && sides.includes("away");
    },
    {
      message: "Must have exactly one home and one away participant",
      path: ["participants"],
    },
  )
  .refine(
    (data) => {
      // Validate at most one winner
      const winners = data.participants.filter((p) => p.isWinner);
      return winners.length <= 1;
    },
    {
      message: "Can have at most one winner",
      path: ["participants"],
    },
  )
  .refine(
    (data) => {
      if (!data.sets || data.sets.length === 0) return true;

      const setNumbers = data.sets.map((s) => s.setNumber).sort((a, b) => a - b);
      return setNumbers.every((num, idx) => num === idx + 1);
    },
    {
      message: "Set numbers must be sequential starting from 1",
      path: ["sets"],
    },
  )
  .refine(
    (data) => {
      // Skip if no sets
      if (!data.sets || data.sets.length === 0) return true;

      // Validate each set has scores for both participants
      const participantUserIds = data.participants.map((p) => p.userId);
      return data.sets.every((set) => {
        const scoreUserIds = set.scores.map((s) => s.userId);
        return participantUserIds.every((uid) => scoreUserIds.includes(uid));
      });
    },
    {
      message: "Each set must have scores for all participants",
      path: ["sets"],
    },
  )
  .refine(
    (data) => {
      // Validate status consistency with timestamps
      // scheduledAt peut être présent pour tout statut (date prévue)
      // startedAt = date réelle de début, finishedAt = date réelle de fin
      if (data.status === "scheduled") {
        // scheduled: pas de startedAt ni finishedAt (seulement scheduledAt possible)
        return !data.startedAt && !data.finishedAt;
      }
      if (data.status === "ongoing") {
        // ongoing: startedAt requis, pas de finishedAt
        return !!data.startedAt && !data.finishedAt;
      }
      if (data.status === "finished") {
        // finished: startedAt et finishedAt requis
        return !!data.startedAt && !!data.finishedAt;
      }
      return true;
    },
    {
      message:
        "Status must be consistent with timestamps (scheduled: no startedAt/finishedAt, ongoing: startedAt only, finished: both)",
      path: ["status"],
    },
  )
  .refine(
    (data) => {
      // Validate date order
      if (data.startedAt && data.finishedAt) {
        return new Date(data.startedAt) <= new Date(data.finishedAt);
      }
      if (data.startedAt) {
        return new Date(data.createdAt) <= new Date(data.startedAt);
      }
      return true;
    },
    {
      message: "Timestamps must be in chronological order",
      path: ["finishedAt"],
    },
  );

export const updateMatchValidator = z
  .object({
    status: z
      .enum(["scheduled", "ongoing", "finished"], {
        message: "Status must be 'scheduled', 'ongoing', or 'finished'",
      })
      .optional(),
    scheduledAt: z
      .string()
      .datetime("Invalid datetime format for scheduledAt")
      .nullable()
      .optional(),
    startedAt: z.string().datetime("Invalid datetime format for startedAt").nullable().optional(),
    finishedAt: z.string().datetime("Invalid datetime format for finishedAt").nullable().optional(),
    winnerId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Validate date order if both are provided
      if (
        data.startedAt &&
        data.finishedAt &&
        data.startedAt !== null &&
        data.finishedAt !== null
      ) {
        return new Date(data.startedAt) <= new Date(data.finishedAt);
      }
      return true;
    },
    {
      message: "startedAt must be before or equal to finishedAt",
      path: ["finishedAt"],
    },
  )
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.status !== undefined ||
        data.scheduledAt !== undefined ||
        data.startedAt !== undefined ||
        data.finishedAt !== undefined ||
        data.winnerId !== undefined
      );
    },
    {
      message: "At least one field must be provided for update",
    },
  );

export const updateMatchScoresValidator = z
  .object({
    sets: z
      .array(setSchema)
      .min(1, "Must provide at least 1 set to update")
      .max(5, "Cannot update more than 5 sets"),
  })
  .refine(
    (data) => {
      // Validate set numbers are unique
      const setNumbers = data.sets.map((s) => s.setNumber);
      return new Set(setNumbers).size === setNumbers.length;
    },
    {
      message: "Set numbers must be unique",
      path: ["sets"],
    },
  )
  .refine(
    (data) => {
      // Validate each set has exactly 2 unique participants
      return data.sets.every((set) => {
        const userIds = set.scores.map((s) => s.userId);
        return userIds.length === 2 && new Set(userIds).size === 2;
      });
    },
    {
      message: "Each set must have scores for exactly 2 unique participants",
      path: ["sets"],
    },
  );

export const listMatchesQueryValidator = z.object({
  status: z.enum(["scheduled", "ongoing", "finished"]).optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  participantOnly: z
    .enum(["true", "false"])
    .default("true")
    .transform((val) => val === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const matchIdValidator = z.object({
  id: z.string().min(1, "Match ID is required"),
});

export const createCommentValidator = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(500, "Comment cannot exceed 500 characters"),
});

export const updateCommentValidator = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(500, "Comment cannot exceed 500 characters"),
});

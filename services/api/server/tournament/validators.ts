import { z } from "zod";

const DRAW_SIZES = [4, 8, 16, 32, 64] as const;
const sportEnum = z.enum(["tennis", "padel"]);
const eventVisibilityEnum = z.enum(["public", "organization"]);

export const createTournamentValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxParticipants: z.number().int().min(1).optional(),
  isFree: z.boolean().optional().default(true),
  price: z.number().int().min(0).optional(),
  paymentLink: z.string().url().optional(),
  visibility: eventVisibilityEnum.optional().default("public"),
  sport: sportEnum,
  drawSize: z.number().int().refine((v) => (DRAW_SIZES as readonly number[]).includes(v), {
    message: "drawSize must be one of 4, 8, 16, 32, 64",
  }),
});

export const listTournamentsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const getTournamentValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
});

export const addSeedValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const removeSeedValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const autoSeedValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
});

export const updateSeedNumberValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  userId: z.string().min(1, "User ID is required"),
  seedNumber: z.number().int().min(1),
});

export const generateBracketValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
});

export const recordMatchWinnerValidator = z.object({
  tournamentMatchId: z.string().min(1, "Match ID is required"),
  winnerUserId: z.string().min(1, "Winner is required"),
});

export const resetMatchValidator = z.object({
  tournamentMatchId: z.string().min(1, "Match ID is required"),
});

export const deleteTournamentValidator = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
});

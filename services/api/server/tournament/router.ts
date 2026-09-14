import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listTournaments, getTournament } from "./queries";
import {
  createTournament,
  addSeed,
  removeSeed,
  autoSeed,
  updateSeedNumber,
  generateBracket,
  recordMatchWinner,
  resetMatch,
  deleteTournament,
} from "./mutations";
import {
  createTournamentValidator,
  listTournamentsValidator,
  getTournamentValidator,
  addSeedValidator,
  removeSeedValidator,
  autoSeedValidator,
  updateSeedNumberValidator,
  generateBracketValidator,
  recordMatchWinnerValidator,
  resetMatchValidator,
  deleteTournamentValidator,
} from "./validators";

export const tournamentRouter = new Hono<HonoContext>();

tournamentRouter.use("/*", requireAuth);

// --- Queries ---
tournamentRouter.get("/list", zValidator("query", listTournamentsValidator), listTournaments);
tournamentRouter.get("/detail", zValidator("query", getTournamentValidator), getTournament);

// --- Mutations ---
tournamentRouter.post("/create", zValidator("json", createTournamentValidator), createTournament);
tournamentRouter.post("/add-seed", zValidator("json", addSeedValidator), addSeed);
tournamentRouter.post("/remove-seed", zValidator("json", removeSeedValidator), removeSeed);
tournamentRouter.post("/auto-seed", zValidator("json", autoSeedValidator), autoSeed);
tournamentRouter.post(
  "/update-seed-number",
  zValidator("json", updateSeedNumberValidator),
  updateSeedNumber,
);
tournamentRouter.post(
  "/generate-bracket",
  zValidator("json", generateBracketValidator),
  generateBracket,
);
tournamentRouter.post(
  "/record-match-winner",
  zValidator("json", recordMatchWinnerValidator),
  recordMatchWinner,
);
tournamentRouter.post("/reset-match", zValidator("json", resetMatchValidator), resetMatch);
tournamentRouter.post(
  "/delete",
  zValidator("json", deleteTournamentValidator),
  deleteTournament,
);

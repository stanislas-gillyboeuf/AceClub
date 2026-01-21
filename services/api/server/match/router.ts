import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import {
  createMatchValidator,
  updateMatchValidator,
  updateMatchScoresValidator,
  matchIdValidator,
} from "./validators";
import {
  createMatch,
  updateMatch,
  updateMatchScores,
  deleteMatch,
} from "./mutations";
import { getMatch, listMatches } from "./queries";

export const matchRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
matchRouter.use("/*", requireAuth);

// List matches with filtering and pagination
// Must be before /:id to avoid route conflicts
matchRouter.get("/", listMatches);

// Create match
matchRouter.post("/", zValidator("json", createMatchValidator), createMatch);

// Get match by ID
matchRouter.get("/:id", getMatch);

// Update match status and timestamps
matchRouter.put(
  "/:id",
  zValidator("json", updateMatchValidator),
  updateMatch
);

// Update match scores (dedicated endpoint for score updates)
matchRouter.put(
  "/:id/scores",
  zValidator("json", updateMatchScoresValidator),
  updateMatchScores
);

// Delete match and all related data
matchRouter.delete("/:id", deleteMatch);

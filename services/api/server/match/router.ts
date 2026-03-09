import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import {
  createMatchValidator,
  updateMatchValidator,
  updateMatchScoresValidator,
  updateVenueValidator,
  createCommentValidator,
  updateCommentValidator,
  createFeedbackValidator,
  updateFeedbackValidator,
} from "./validators";
import {
  createMatch,
  updateMatch,
  updateMatchScores,
  updateVenue,
  deleteMatch,
  createComment,
  updateComment,
  deleteComment,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  uploadPhoto,
  deletePhoto,
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
matchRouter.put("/:id", zValidator("json", updateMatchValidator), updateMatch);

// Update match scores (dedicated endpoint for score updates)
matchRouter.put("/:id/scores", zValidator("json", updateMatchScoresValidator), updateMatchScores);

// Update match venue
matchRouter.put("/:id/venue", zValidator("json", updateVenueValidator), updateVenue);

// Delete match and all related data
matchRouter.delete("/:id", deleteMatch);

// Comment endpoints
matchRouter.post("/:id/comment", zValidator("json", createCommentValidator), createComment);
matchRouter.put("/:id/comment", zValidator("json", updateCommentValidator), updateComment);
matchRouter.delete("/:id/comment", deleteComment);

// Photo endpoints
matchRouter.post("/:id/photo", uploadPhoto);
matchRouter.delete("/:id/photo", deletePhoto);

// Feedback endpoints
matchRouter.post("/:id/feedback", zValidator("json", createFeedbackValidator), createFeedback);
matchRouter.put("/:id/feedback", zValidator("json", updateFeedbackValidator), updateFeedback);
matchRouter.delete("/:id/feedback", deleteFeedback);

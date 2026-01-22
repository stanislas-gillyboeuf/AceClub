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
import { createMatch, updateMatch, updateMatchScores, deleteMatch } from "./mutations";
import { getMatch, listMatches } from "./queries";
import { z } from "zod";

// Custom validator with detailed logging
const loggedValidator = (schema: z.ZodSchema, label: string) => {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      console.error(`❌ [${label}] Zod validation failed`);
      console.error(`📥 [${label}] Input data:`, JSON.stringify(result.data, null, 2));
      console.error(
        `❌ [${label}] Validation errors:`,
        JSON.stringify((result.error as z.ZodError).format(), null, 2),
      );
      console.error(
        `❌ [${label}] Flattened errors:`,
        JSON.stringify((result.error as z.ZodError).flatten(), null, 2),
      );

      return c.json(
        {
          error: "Validation error",
          message: "Invalid request data",
          details: (result.error as z.ZodError).flatten(),
        },
        400,
      );
    }
    console.log(`✅ [${label}] Zod validation passed`);
  });
};

export const matchRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
matchRouter.use("/*", requireAuth);

// List matches with filtering and pagination
// Must be before /:id to avoid route conflicts
matchRouter.get("/", listMatches);

// Create match
matchRouter.post("/", loggedValidator(createMatchValidator, "CREATE MATCH"), createMatch);

// Get match by ID
matchRouter.get("/:id", getMatch);

// Update match status and timestamps
matchRouter.put("/:id", loggedValidator(updateMatchValidator, "UPDATE MATCH"), updateMatch);

// Update match scores (dedicated endpoint for score updates)
matchRouter.put(
  "/:id/scores",
  loggedValidator(updateMatchScoresValidator, "UPDATE MATCH SCORES"),
  updateMatchScores,
);

// Delete match and all related data
matchRouter.delete("/:id", deleteMatch);

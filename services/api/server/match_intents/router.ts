import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import { createMatchIntentValidator, createRequestValidator } from "./validators";
import {
  createMatchIntent,
  deleteMatchIntent,
  createRequest,
  acceptRequest,
  rejectRequest,
} from "./mutations";
import { listMatchIntents, discover, listRequests } from "./queries";

export const matchIntentRouter = new Hono<HonoContext>();

matchIntentRouter.use("/*", requireAuth);

// Queries
matchIntentRouter.get("/", listMatchIntents); // Mes intents
matchIntentRouter.get("/discover", discover); // Feed de découverte
matchIntentRouter.get("/requests", listRequests); // Mes demandes reçues

// Mutations
matchIntentRouter.post("/", zValidator("json", createMatchIntentValidator), createMatchIntent); // Créer une intent
matchIntentRouter.delete("/:id", deleteMatchIntent); // Supprimer une intent (owner only)
matchIntentRouter.post("/:id/request", zValidator("json", createRequestValidator), createRequest); // Demander à rejoindre une intent
matchIntentRouter.post("/requests/:id/accept", acceptRequest); // Accepter une demande
matchIntentRouter.post("/requests/:id/reject", rejectRequest); // Refuser une demande

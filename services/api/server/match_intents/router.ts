import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import { createMatchIntentValidator } from "./validators";
import { createMatchIntent, deleteMatchIntent, swipe, acceptRequest, rejectRequest } from "./mutations";
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
matchIntentRouter.post("/swipe", swipe); // Swiper sur une intent
matchIntentRouter.post("/requests/:id/accept", acceptRequest); // Accepter une demande
matchIntentRouter.post("/requests/:id/reject", rejectRequest); // Refuser une demande
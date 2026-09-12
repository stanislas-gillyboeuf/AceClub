import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listDuesTypes, listAssignments, getMemberDuesHistory } from "./queries";
import { createDuesType, updateDuesType, assignDues, markPaid, waive, sendReminder } from "./mutations";
import {
  listDuesTypesValidator,
  listAssignmentsValidator,
  getMemberDuesHistoryValidator,
  createDuesTypeValidator,
  updateDuesTypeValidator,
  assignDuesValidator,
  markPaidValidator,
  waiveValidator,
  sendReminderValidator,
} from "./validators";

export const duesRouter = new Hono<HonoContext>();

duesRouter.use("/*", requireAuth);

// --- Queries (all full-admin only, enforced in each handler) ---
duesRouter.get("/types", zValidator("query", listDuesTypesValidator), listDuesTypes);
duesRouter.get("/assignments", zValidator("query", listAssignmentsValidator), listAssignments);
duesRouter.get(
  "/member-history",
  zValidator("query", getMemberDuesHistoryValidator),
  getMemberDuesHistory,
);

// --- Mutations ---
duesRouter.post("/types/create", zValidator("json", createDuesTypeValidator), createDuesType);
duesRouter.post("/types/update", zValidator("json", updateDuesTypeValidator), updateDuesType);
duesRouter.post("/assign", zValidator("json", assignDuesValidator), assignDues);
duesRouter.post("/mark-paid", zValidator("json", markPaidValidator), markPaid);
duesRouter.post("/waive", zValidator("json", waiveValidator), waive);
duesRouter.post("/send-reminder", zValidator("json", sendReminderValidator), sendReminder);

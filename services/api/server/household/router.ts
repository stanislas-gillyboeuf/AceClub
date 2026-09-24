import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listHouseholds, getHousehold } from "./queries";
import { createHousehold, updateHousehold, deleteHousehold, setMemberHousehold } from "./mutations";
import {
  listHouseholdsValidator,
  getHouseholdValidator,
  createHouseholdValidator,
  updateHouseholdValidator,
  deleteHouseholdValidator,
  setMemberHouseholdValidator,
} from "./validators";

export const householdRouter = new Hono<HonoContext>();

householdRouter.use("/*", requireAuth);

householdRouter.get("/list", zValidator("query", listHouseholdsValidator), listHouseholds);
householdRouter.get("/detail", zValidator("query", getHouseholdValidator), getHousehold);
householdRouter.post("/create", zValidator("json", createHouseholdValidator), createHousehold);
householdRouter.post("/update", zValidator("json", updateHouseholdValidator), updateHousehold);
householdRouter.post("/delete", zValidator("json", deleteHouseholdValidator), deleteHousehold);
householdRouter.post("/set-member-household", zValidator("json", setMemberHouseholdValidator), setMemberHousehold);

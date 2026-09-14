import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { HonoContext } from "../../types/hono";
import { requireAuth } from "../../middleware/auth";
import { listVacationPeriods } from "./queries";
import { createVacationPeriod, deleteVacationPeriod } from "./mutations";
import {
  listVacationPeriodsValidator,
  createVacationPeriodValidator,
  deleteVacationPeriodValidator,
} from "./validators";

export const vacationPeriodRouter = new Hono<HonoContext>();

vacationPeriodRouter.use("/*", requireAuth);

vacationPeriodRouter.get(
  "/list",
  zValidator("query", listVacationPeriodsValidator),
  listVacationPeriods,
);
vacationPeriodRouter.post(
  "/create",
  zValidator("json", createVacationPeriodValidator),
  createVacationPeriod,
);
vacationPeriodRouter.post(
  "/delete",
  zValidator("json", deleteVacationPeriodValidator),
  deleteVacationPeriod,
);

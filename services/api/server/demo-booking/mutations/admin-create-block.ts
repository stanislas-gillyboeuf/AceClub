import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoManualBlock } from "../../../db/schema";
import { createManualBlockValidator } from "../validators";

export const createAdminBlock = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof createManualBlockValidator>;

  const [created] = await db
    .insert(demoManualBlock)
    .values({
      date: body.date ?? null,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      reason: body.reason ?? null,
    })
    .returning();

  return c.json(created, 201);
};

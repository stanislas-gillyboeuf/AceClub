import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { duesType } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { createDuesTypeValidator } from "../validators";

export const createDuesType = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createDuesTypeValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [created] = await db
    .insert(duesType)
    .values({
      organizationId: validated.organizationId,
      name: validated.name,
      amountCents: validated.amountCents,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      isActive: validated.isActive,
    })
    .returning();

  return c.json(created, 201);
};

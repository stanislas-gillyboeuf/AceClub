import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubMemberNote } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { addMemberNoteValidator } from "../validators";

export const addMemberNote = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberNoteValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [created] = await db
    .insert(clubMemberNote)
    .values({
      organizationId: validated.organizationId,
      userId: validated.userId,
      authorUserId: currentUser.id,
      body: validated.body.trim(),
    })
    .returning();

  return c.json(created, 201);
};

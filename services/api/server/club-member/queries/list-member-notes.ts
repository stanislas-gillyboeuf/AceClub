import { Context } from "hono";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubMemberNote, user } from "../../../db/schema";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { listMemberNotesValidator } from "../validators";

const author = alias(user, "author");

export const listMemberNotes = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listMemberNotesValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const notes = await db
    .select({
      id: clubMemberNote.id,
      body: clubMemberNote.body,
      createdAt: clubMemberNote.createdAt,
      authorUserId: clubMemberNote.authorUserId,
      authorName: author.name,
    })
    .from(clubMemberNote)
    .innerJoin(author, eq(clubMemberNote.authorUserId, author.id))
    .where(
      and(
        eq(clubMemberNote.organizationId, validated.organizationId),
        eq(clubMemberNote.userId, validated.userId),
      ),
    )
    .orderBy(desc(clubMemberNote.createdAt));

  return c.json(notes);
};

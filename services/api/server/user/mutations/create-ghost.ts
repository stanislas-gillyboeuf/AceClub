import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user as userTable } from "../../../db/schema/auth/schema";
import { z } from "zod";
import { createGhostValidator } from "../validators";
import { ulid } from "ulid";
import { getUserClubIds, isSuperAdmin } from "../../../lib/club-access";
import { sharesClub } from "../../match_intents/lib/visibility";

export const createGhost = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createGhostValidator>;

  // Check if a user with this email already exists
  const [existingUser] = await db
    .select({ id: userTable.id, is_ghost: userTable.is_ghost })
    .from(userTable)
    .where(eq(userTable.email, validated.email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    if (existingUser.is_ghost) {
      // A ghost that belongs to another club is not handed out (name, photo) to a stranger.
      const currentUser = c.get("user")!;
      const [ghostClubIds, callerClubIds] = await Promise.all([
        getUserClubIds(existingUser.id),
        getUserClubIds(currentUser.id),
      ]);
      if (ghostClubIds.length > 0 && !isSuperAdmin(currentUser) && !sharesClub(callerClubIds, ghostClubIds)) {
        return c.json(
          { error: "Conflict", message: "A user with this email already exists" },
          409,
        );
      }

      // Return the existing ghost user (without its email)
      const [ghost] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, existingUser.id))
        .limit(1);

      return c.json({
        id: ghost.id,
        name: ghost.name,
        image: ghost.image,
        isGhost: ghost.is_ghost,
        createdAt: ghost.createdAt,
      });
    }

    // A real user with this email exists
    return c.json(
      {
        error: "Conflict",
        message: "A user with this email already exists",
      },
      409,
    );
  }

  // Create the ghost user
  const [ghostUser] = await db
    .insert(userTable)
    .values({
      id: ulid(),
      name: validated.name,
      email: validated.email.toLowerCase(),
      emailVerified: false,
      is_ghost: true,
    })
    .returning();

  return c.json(
    {
      id: ghostUser.id,
      name: ghostUser.name,
      image: ghostUser.image,
      isGhost: ghostUser.is_ghost,
      createdAt: ghostUser.createdAt,
    },
    201,
  );
};

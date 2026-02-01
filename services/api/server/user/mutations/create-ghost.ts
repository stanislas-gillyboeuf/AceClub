import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user as userTable } from "../../../db/schema/auth/schema";
import { z } from "zod";
import { createGhostValidator } from "../validators";
import { ulid } from "ulid";

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
      // Return the existing ghost user
      const [ghost] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, existingUser.id))
        .limit(1);

      return c.json({
        id: ghost.id,
        name: ghost.name,
        email: ghost.email,
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
      email: ghostUser.email,
      image: ghostUser.image,
      isGhost: ghostUser.is_ghost,
      createdAt: ghostUser.createdAt,
    },
    201,
  );
};

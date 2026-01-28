import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { searchUsersValidator } from "../validators";
import { db } from "../../../db";
import { user } from "../../../db/schema/auth/schema";
import { and, eq, ilike, or } from "drizzle-orm";

export const searchUsers = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof searchUsersValidator>;
    const phoneQuery = validated.query.replace(/[^0-9+]/g, "");

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(
        and(
          or(
            ilike(user.name, `%${validated.query}%`),
            ilike(user.email, `%${validated.query}%`),
            ilike(user.phoneNumber, `%${phoneQuery || validated.query}%`),
          ),
          eq(user.banned, false),
        ),
      )
      .limit(validated.limit);

    return c.json({
      users,
      count: users.length,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      500,
    );
  }
};

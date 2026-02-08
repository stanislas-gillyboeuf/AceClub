import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { requestClubValidator } from "../validators";
import { db } from "../../../db";
import { clubRequest } from "../../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ulid } from "ulid";

export const requestClub = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof requestClubValidator>;

    const normalizedName = validated.name.trim().toLowerCase();
    const normalizedCity = validated.city.trim().toLowerCase();

    const [existing] = await db
      .select()
      .from(clubRequest)
      .where(
        and(
          sql`LOWER(${clubRequest.name}) = ${normalizedName}`,
          sql`LOWER(${clubRequest.city}) = ${normalizedCity}`,
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(clubRequest)
        .set({
          requestCount: existing.requestCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(clubRequest.id, existing.id))
        .returning();

      return c.json({
        success: true,
        message: "Votre demande a été enregistrée",
        requestCount: updated.requestCount,
        status: updated.status,
      });
    }

    const [created] = await db
      .insert(clubRequest)
      .values({
        id: ulid(),
        name: validated.name.trim(),
        city: validated.city.trim(),
        requestCount: 1,
        status: "pending",
      })
      .returning();

    return c.json({
      success: true,
      message: "Votre demande a été enregistrée",
      requestCount: created.requestCount,
      status: created.status,
    });
  } catch (error) {
    console.error("Request club error:", error);
    return c.json(
      { error: "Failed to submit club request", message: (error as Error).message },
      500,
    );
  }
};

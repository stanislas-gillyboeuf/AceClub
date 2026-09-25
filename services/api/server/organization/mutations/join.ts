import { Context } from "hono";
import { and, eq, ne } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";
import { HonoContext } from "../../../types/hono";
import { joinOrganizationValidator } from "../validators";
import { auth } from "../../../auth";
import { db } from "../../../db";
import { member, organization } from "../../../db/schema/auth/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { cacheDel, CacheKeys } from "../../../lib/cache";
import { invalidateUserClubIds } from "../../../lib/club-access";
import { checkClubPin, tooManyAttempts } from "../lib/pin";

function isHidden(metadata: string | null): boolean {
  if (!metadata) return false;
  try {
    const meta = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return !!meta?.hidden;
  } catch {
    return false;
  }
}

/**
 * The only way for a player to join a club by themselves: the caller becomes a plain `member`,
 * the PIN (if the club has one) is checked here, server side. Same club-replacement behavior as
 * PUT /user/profile: a player belongs to one club, so their other memberships are dropped.
 */
export const joinOrganization = async (c: Context<HonoContext>) => {
  const authUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof joinOrganizationValidator>;

  const [org] = await db
    .select({
      id: organization.id,
      pin: organization.pin,
      pinEnabled: organization.pinEnabled,
      metadata: organization.metadata,
    })
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!org || isHidden(org.metadata)) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  if (org.pinEnabled && org.pin) {
    const check = checkClubPin(authUser.id, org.id, validated.pin ?? "", org.pin);
    if (check.status === "limited") {
      c.header("Retry-After", String(check.retryAfterSeconds));
      return c.json(tooManyAttempts(check.retryAfterSeconds), 429);
    }
    if (check.status === "invalid") {
      return c.json({ error: "InvalidPin", message: "Code PIN incorrect" }, 403);
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(member)
      .where(and(eq(member.userId, authUser.id), ne(member.organizationId, org.id)));

    const [existing] = await tx
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.organizationId, org.id), eq(member.userId, authUser.id)))
      .limit(1);

    if (!existing) {
      await tx.insert(member).values({
        id: ulid(),
        organizationId: org.id,
        userId: authUser.id,
        role: "member",
        createdAt: new Date(),
      });
    }

    await tx
      .update(userPreference)
      .set({ organizationId: org.id, updatedAt: new Date() })
      .where(eq(userPreference.userId, authUser.id));
  });

  await invalidateUserClubIds(authUser.id);
  await cacheDel(CacheKeys.userMe(authUser.id));

  try {
    await auth.api.setActiveOrganization({
      body: { organizationId: org.id },
      headers: c.req.raw.headers,
    });
  } catch (error) {
    console.error("[join] setActiveOrganization failed:", error);
  }

  return c.json({ organizationId: org.id, joined: true });
};

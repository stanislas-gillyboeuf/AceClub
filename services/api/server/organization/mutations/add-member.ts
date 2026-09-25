import { Context } from "hono";
import { eq } from "drizzle-orm";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { addMemberValidator } from "../validators";
import { auth } from "../../../auth";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { forbidden, invalidateUserClubIds, isSuperAdmin } from "../../../lib/club-access";
import { cacheDel, cacheInvalidatePrefix, CacheKeys } from "../../../lib/cache";
import { assertOrgAdmin } from "../../../middleware/org-member";
import { decideAddMember, httpStatusFromAuthError } from "../lib/access-rules";
import { checkClubPin, tooManyAttempts } from "../lib/pin";

export const addMember = async (c: Context<HonoContext>) => {
  const authUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberValidator>;

  if (!validated.organizationId) {
    return c.json({ error: "BadRequest", message: "organizationId is required" }, 400);
  }
  const organizationId = validated.organizationId;

  const [org] = await db
    .select({ pin: organization.pin, pinEnabled: organization.pinEnabled })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);
  if (!org) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  const superAdmin = isSuperAdmin(authUser);
  const orgAdmin = superAdmin ? true : await assertOrgAdmin(authUser.id, organizationId);

  // Legacy « join » (target = the caller, plain member): allowed without a PIN only if the club
  // has none; with a PIN, the right one must come in the body (still counted by the limiter).
  const orgPinRequired = !!(org.pinEnabled && org.pin);
  let pinValid = false;
  if (orgPinRequired && !orgAdmin && validated.pin) {
    const check = checkClubPin(authUser.id, organizationId, validated.pin, org.pin!);
    if (check.status === "limited") {
      c.header("Retry-After", String(check.retryAfterSeconds));
      return c.json(tooManyAttempts(check.retryAfterSeconds), 429);
    }
    pinValid = check.status === "ok";
  }

  const decision = decideAddMember({
    actorId: authUser.id,
    targetUserId: validated.userId,
    role: validated.role,
    isSuperAdmin: superAdmin,
    isOrgAdmin: orgAdmin,
    pinValid,
    orgPinRequired,
  });
  if (!decision.allowed) {
    return c.json({ error: "Forbidden", message: decision.reason }, 403);
  }

  try {
    const data = await auth.api.addMember({
      body: {
        userId: validated.userId || "",
        role: validated.role as "member" | "admin" | "owner" | ("member" | "admin" | "owner")[],
        organizationId,
      },
      headers: c.req.raw.headers,
    });

    await invalidateUserClubIds(validated.userId);
    await Promise.all([
      cacheDel(CacheKeys.orgStats(organizationId)),
      cacheInvalidatePrefix(CacheKeys.prefixLeaderboardOrg(organizationId)),
    ]);

    return c.json(data);
  } catch (error) {
    const status = httpStatusFromAuthError(error);
    if (status === 403) return forbidden(c);
    return c.json({ error: "Error", message: (error as Error).message }, status);
  }
};

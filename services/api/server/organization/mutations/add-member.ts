import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { addMemberValidator } from "../validators";
import { auth } from "../../../auth";
import { cacheDel, cacheInvalidatePrefix, CacheKeys } from "../../../lib/cache";

export const addMember = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberValidator>;

  const data = await auth.api.addMember({
    body: {
      userId: validated.userId || "",
      role: validated.role as "member" | "admin" | "owner" | ("member" | "admin" | "owner")[],
      organizationId: validated.organizationId,
    },
    headers: c.req.raw.headers,
  });

  if (validated.organizationId) {
    await Promise.all([
      cacheDel(CacheKeys.orgStats(validated.organizationId)),
      cacheInvalidatePrefix(CacheKeys.prefixLeaderboardOrg(validated.organizationId)),
    ]);
  }

  return c.json(data);
};

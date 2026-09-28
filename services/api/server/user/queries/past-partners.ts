import { Context } from "hono";
import { eq, inArray } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, userPreference } from "../../../db/schema";
import { getBlockedUserIds } from "../../../lib/block";
import { loadPartnerSignals, mergePastPartnerSignals } from "../lib/past-partners";

const PAST_PARTNERS_LIMIT = 20;

/**
 * Players the caller has already played a match with, or has an active direct conversation with —
 * across every club. Meant to be offered first when adding players to a match. Excludes blocked
 * users; most recent interaction first.
 */
export const listPastPartners = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  const signals = await loadPartnerSignals(currentUser.id);
  const candidateIds = [...new Set(signals.map((s) => s.userId))];
  const blockedIds = await getBlockedUserIds(currentUser.id, candidateIds);

  const merged = mergePastPartnerSignals(signals, blockedIds, PAST_PARTNERS_LIMIT);
  if (merged.length === 0) return c.json({ partners: [] });

  const ids = merged.map((m) => m.userId);
  const details = await db
    .select({ id: user.id, name: user.name, image: user.image, skillLevel: userPreference.skillLevel })
    .from(user)
    .leftJoin(userPreference, eq(userPreference.userId, user.id))
    .where(inArray(user.id, ids));
  const byId = new Map(details.map((d) => [d.id, d]));

  const partners = merged
    .map((m) => {
      const d = byId.get(m.userId);
      if (!d) return null;
      return {
        id: d.id,
        name: d.name,
        image: d.image,
        skillLevel: d.skillLevel ?? null,
        lastInteractionAt: m.lastInteractionAt,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return c.json({ partners });
};

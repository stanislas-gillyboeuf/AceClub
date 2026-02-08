import { lt, and, eq } from "drizzle-orm";
import { db } from "../../../db";
import {
  matchIntent,
  matchIntentSwipe,
  matchRequest,
} from "../../../db/schema/match_intents/schema";

/**
 * Supprime les match intents expirés (date passée) et leurs données associées.
 * Appelé par un cron job ou manuellement.
 */
export async function cleanupExpiredMatchIntents(): Promise<{
  deletedIntents: number;
  deletedSwipes: number;
  deletedRequests: number;
}> {
  const now = new Date();

  // Récupérer les IDs des intents expirés
  const expiredIntents = await db
    .select({ id: matchIntent.id })
    .from(matchIntent)
    .where(and(lt(matchIntent.date, now), eq(matchIntent.status, "pending")));

  if (expiredIntents.length === 0) {
    console.log("[CLEANUP] No expired match intents found");
    return { deletedIntents: 0, deletedSwipes: 0, deletedRequests: 0 };
  }

  const expiredIds = expiredIntents.map((i) => i.id);
  console.log(`[CLEANUP] Found ${expiredIds.length} expired match intents to clean up`);

  let deletedSwipes = 0;
  let deletedRequests = 0;

  // Supprimer en cascade pour chaque intent expirée
  for (const intentId of expiredIds) {
    // 1. Supprimer les swipes associés
    const swipeResult = await db
      .delete(matchIntentSwipe)
      .where(eq(matchIntentSwipe.matchIntentId, intentId))
      .returning({ id: matchIntentSwipe.id });
    deletedSwipes += swipeResult.length;

    // 2. Supprimer les match requests associés
    const requestResult = await db
      .delete(matchRequest)
      .where(eq(matchRequest.matchIntentId, intentId))
      .returning({ id: matchRequest.id });
    deletedRequests += requestResult.length;

    // 3. Supprimer l'intent elle-même
    await db.delete(matchIntent).where(eq(matchIntent.id, intentId));
  }

  console.log(
    `[CLEANUP] Deleted ${expiredIds.length} intents, ${deletedSwipes} swipes, ${deletedRequests} requests`,
  );

  return {
    deletedIntents: expiredIds.length,
    deletedSwipes,
    deletedRequests,
  };
}

/**
 * Marque les match intents expirés comme "rejected" au lieu de les supprimer.
 * Alternative plus douce si on veut garder l'historique.
 */
export async function markExpiredMatchIntentsAsRejected(): Promise<number> {
  const now = new Date();

  const result = await db
    .update(matchIntent)
    .set({ status: "rejected" })
    .where(and(lt(matchIntent.date, now), eq(matchIntent.status, "pending")))
    .returning({ id: matchIntent.id });

  console.log(`[CLEANUP] Marked ${result.length} expired match intents as rejected`);

  return result.length;
}

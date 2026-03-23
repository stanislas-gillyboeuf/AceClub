import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { matchPhoto } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";
import { deleteObject, extractKeyFromUrl } from "../../../lib/minio";
import { cacheDel, CacheKeys } from "../../../lib/cache";

export const deletePhoto = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const matchId = c.req.param("id");

  // Find user's photo for this match
  const [photo] = await db
    .select()
    .from(matchPhoto)
    .where(and(eq(matchPhoto.matchId, matchId), eq(matchPhoto.userId, currentUser.id)))
    .limit(1);

  if (!photo) {
    return c.json({ error: "NotFound", message: "No photo found for this match" }, 404);
  }

  // Delete from S3
  const storageKey = extractKeyFromUrl(photo.imageUrl);
  await deleteObject(storageKey);

  // Delete from DB
  await db.delete(matchPhoto).where(eq(matchPhoto.id, photo.id));

  // Invalidate cache
  await cacheDel(CacheKeys.matchPhotos(matchId));

  return c.json({ success: true, message: "Photo deleted" });
};

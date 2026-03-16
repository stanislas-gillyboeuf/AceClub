import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { match, matchParticipant, matchPhoto } from "../../../db/schema/match/schema";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { uploadBuffer } from "../../../lib/minio";
import { processImage } from "../../../lib/image-processor";
import { cacheDel, CacheKeys } from "../../../lib/cache";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadPhoto = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const matchId = c.req.param("id");

  // Run all validation queries in parallel
  const [[foundMatch], [participation], [existingPhoto]] = await Promise.all([
    db.select().from(match).where(eq(match.id, matchId)).limit(1),
    db
      .select()
      .from(matchParticipant)
      .where(and(eq(matchParticipant.matchId, matchId), eq(matchParticipant.userId, currentUser.id)))
      .limit(1),
    db
      .select()
      .from(matchPhoto)
      .where(and(eq(matchPhoto.matchId, matchId), eq(matchPhoto.userId, currentUser.id)))
      .limit(1),
  ]);

  if (!foundMatch) {
    return c.json({ error: "NotFound", message: "Match not found" }, 404);
  }
  if (foundMatch.status !== "ongoing" && foundMatch.status !== "finished") {
    return c.json({ error: "BadRequest", message: "Photos can only be added to ongoing or finished matches" }, 400);
  }
  if (!participation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }
  if (existingPhoto) {
    return c.json({ error: "Conflict", message: "You already have a photo for this match" }, 409);
  }

  // Parse multipart form
  const formData = await c.req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return c.json({ error: "BadRequest", message: "No image provided" }, 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json({ error: "BadRequest", message: `Unsupported file type: ${file.type}` }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "BadRequest", message: "File too large. Max 10MB" }, 400);
  }

  // Process image
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await processImage(rawBuffer);

  // Upload to S3
  const fileId = ulid();
  const storageKey = `matches/${matchId}/${currentUser.id}-${fileId}.webp`;
  const imageUrl = await uploadBuffer(storageKey, processedBuffer, "image/webp");

  // Insert into DB
  const [photo] = await db
    .insert(matchPhoto)
    .values({
      matchId,
      userId: currentUser.id,
      imageUrl,
    })
    .returning();

  // Invalidate cache
  await cacheDel(CacheKeys.matchPhotos(matchId));

  return c.json({ photo }, 201);
};

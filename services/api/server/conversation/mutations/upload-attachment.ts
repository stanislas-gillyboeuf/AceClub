import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { conversationParticipant } from "../../../db/schema/conversation/schema";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { uploadBuffer } from "../../../lib/minio";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "audio/m4a",
  "audio/mp4",
  "audio/x-m4a",
  "audio/mpeg",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB

function getExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/mpeg": "mp3",
  };
  return map[mimeType] || "bin";
}

export const uploadAttachment = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const conversationId = c.req.param("id");

  // Verify user is a participant
  const [myParticipation] = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, currentUser.id),
      ),
    )
    .limit(1);

  if (!myParticipation) {
    return c.json({ error: "Forbidden", message: "Not a participant" }, 403);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json({ error: "BadRequest", message: "No file provided" }, 400);
  }

  const mimeType = file.type;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return c.json(
      { error: "BadRequest", message: `Unsupported file type: ${mimeType}` },
      400,
    );
  }

  const isAudio = mimeType.startsWith("audio/");
  const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return c.json(
      {
        error: "BadRequest",
        message: `File too large. Max ${isAudio ? "5MB" : "10MB"}`,
      },
      400,
    );
  }

  const ext = getExtFromMime(mimeType);
  const fileId = ulid();
  const storageKey = `conversations/${conversationId}/attachments/${fileId}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = await uploadBuffer(storageKey, buffer, mimeType);

  return c.json(
    {
      attachmentUrl: publicUrl,
    },
    201,
  );
};

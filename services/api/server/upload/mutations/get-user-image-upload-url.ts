import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { uploadBuffer } from "../../../lib/minio";
import { processProfileImage } from "../../../lib/image-processor";
import { ulid } from "ulid";

export const uploadUserImage = async (c: Context<HonoContext>) => {
  const user = c.get("user")!;

  const formData = await c.req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "BadRequest", message: "Image file is required" }, 400);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { error: "BadRequest", message: "Content type must be image/jpeg, image/png, image/webp, or image/heic" },
      400,
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const processedBuffer = await processProfileImage(arrayBuffer);

  const key = `users/${user.id}/profile-${ulid()}.webp`;
  const imageUrl = await uploadBuffer(key, processedBuffer, "image/webp");

  return c.json({ imageUrl });
};

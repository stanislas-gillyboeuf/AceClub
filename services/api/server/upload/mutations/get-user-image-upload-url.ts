import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { generateUploadUrl } from "../../../lib/minio";
import { ulid } from "ulid";

export const getUserImageUploadUrl = async (c: Context<HonoContext>) => {
  const user = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as { contentType: string };

  const extension = validated.contentType.split("/")[1];
  const key = `users/${user.id}/profile-${ulid()}.${extension}`;

  const { signedUrl, publicUrl } = await generateUploadUrl(key, validated.contentType);

  return c.json({
    uploadUrl: signedUrl,
    imageUrl: publicUrl,
    expiresIn: 3600,
  });
};

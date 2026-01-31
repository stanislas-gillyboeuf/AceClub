import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { generateUploadUrl } from "../../../lib/minio";
import { ulid } from "ulid";
import { db } from "../../../db";
import { member } from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";

export const getOrgLogoUploadUrl = async (c: Context<HonoContext>) => {
  const user = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as { organizationId: string; contentType: string };

  const [memberRecord] = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, validated.organizationId), eq(member.userId, user.id)))
    .limit(1);

  if (!memberRecord || !["owner", "admin"].includes(memberRecord.role)) {
    return c.json(
      {
        error: "Forbidden",
        message: "Not authorized to update organization logo",
      },
      403,
    );
  }

  const extension = validated.contentType.split("/")[1];
  const key = `organizations/${validated.organizationId}/logo-${ulid()}.${extension}`;

  const { signedUrl, publicUrl } = await generateUploadUrl(key, validated.contentType);

  return c.json({
    uploadUrl: signedUrl,
    logoUrl: publicUrl,
    expiresIn: 3600,
  });
};

import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { uploadBuffer } from "../../../lib/minio";
import { processOrganizationLogo } from "../../../lib/image-processor";
import { ulid } from "ulid";
import { db } from "../../../db";
import { member } from "../../../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";

export const uploadOrgLogo = async (c: Context<HonoContext>) => {
  const user = c.get("user")!;

  const formData = await c.req.formData();
  const file = formData.get("image");
  const organizationId = formData.get("organizationId");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "BadRequest", message: "Image file is required" }, 400);
  }

  if (!organizationId || typeof organizationId !== "string") {
    return c.json({ error: "BadRequest", message: "Organization ID is required" }, 400);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return c.json(
      {
        error: "BadRequest",
        message: "Content type must be image/jpeg, image/png, image/webp, or image/heic",
      },
      400,
    );
  }

  const [memberRecord] = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, user.id)))
    .limit(1);

  if (!memberRecord || !["owner", "admin"].includes(memberRecord.role)) {
    if (user.role !== "admin") {
      return c.json(
        {
          error: "Forbidden",
          message: "Not authorized to update organization logo",
        },
        403,
      );
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const processedBuffer = await processOrganizationLogo(arrayBuffer);

  const key = `organizations/${organizationId}/logo-${ulid()}.webp`;
  const logoUrl = await uploadBuffer(key, processedBuffer, "image/webp");

  return c.json({ logoUrl });
};

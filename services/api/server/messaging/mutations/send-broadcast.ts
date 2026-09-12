import { Context } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { broadcastMessage, organization } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { sendBroadcastValidator } from "../validators";
import { resolveSegment } from "../lib/segments";
import { sendBatchEmails } from "../../../services/mailer";
import { clubAnnouncementEmail } from "../../../services/mailer/templates";
import { sendBatchNotifications } from "../../../services/expo-push/broadcast-service";

export const sendBroadcast = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof sendBroadcastValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const [org] = await db
    .select({ name: organization.name })
    .from(organization)
    .where(eq(organization.id, validated.organizationId))
    .limit(1);

  if (!org) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  const recipients = await resolveSegment(validated.organizationId, validated.segment);

  if (validated.channel === "email" || validated.channel === "both") {
    const email = clubAnnouncementEmail({
      clubName: org.name,
      subject: validated.subject,
      body: validated.body,
    });
    await sendBatchEmails(
      recipients.map((r) => ({ to: r.email, subject: email.subject, html: email.html, text: email.text })),
    );
  }

  if (validated.channel === "push" || validated.channel === "both") {
    await sendBatchNotifications(
      recipients.map((r) => r.userId),
      { type: "club_announcement", title: validated.subject, body: validated.body },
    );
  }

  const [log] = await db
    .insert(broadcastMessage)
    .values({
      organizationId: validated.organizationId,
      senderId: currentUser.id,
      subject: validated.subject,
      body: validated.body,
      channel: validated.channel,
      segment: validated.segment,
      recipientCount: recipients.length,
    })
    .returning();

  return c.json(log, 201);
};

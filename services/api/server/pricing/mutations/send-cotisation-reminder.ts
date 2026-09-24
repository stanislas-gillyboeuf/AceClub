import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../../../db";
import { memberCotisation, memberCotisationReminderLog, user, organization } from "../../../db/schema";
import type { HonoContext } from "../../../types/hono";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { sendEmail } from "../../../services/mailer";
import { duesReminderEmail } from "../../../services/mailer/templates";
import { sendCotisationReminderValidator } from "../validators";

export const sendCotisationReminder = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof sendCotisationReminderValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  // A reminder only makes sense for a cotisation that was issued — never create one implicitly.
  const [record] = await db
    .select()
    .from(memberCotisation)
    .where(
      and(
        eq(memberCotisation.organizationId, validated.organizationId),
        eq(memberCotisation.userId, validated.userId),
        eq(memberCotisation.seasonLabel, validated.seasonLabel),
      ),
    )
    .limit(1);

  if (!record) {
    return c.json({ error: "NotFound", message: "This cotisation has not been issued yet" }, 404);
  }
  if (record.status !== "pending") {
    return c.json({ error: "BadRequest", message: "Cannot send a reminder for a paid or waived cotisation" }, 400);
  }

  const [memberRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, record.userId))
    .limit(1);
  const [orgRow] = await db
    .select({ name: organization.name })
    .from(organization)
    .where(eq(organization.id, record.organizationId))
    .limit(1);

  if (!memberRow || !orgRow) {
    return c.json({ error: "NotFound", message: "Member or club not found" }, 404);
  }

  const email = duesReminderEmail({
    clubName: orgRow.name,
    memberName: memberRow.name,
    duesTypeName: `Cotisation ${record.seasonLabel}`,
    amountCents: record.amountCents,
    dueDate: null,
  });

  const sendResult = await sendEmail({
    to: memberRow.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (!sendResult.success) {
    return c.json({ error: "InternalError", message: `Failed to send reminder: ${sendResult.reason}` }, 500);
  }

  const [log] = await db
    .insert(memberCotisationReminderLog)
    .values({
      id: ulid(),
      memberCotisationId: record.id,
      sentByUserId: currentUser.id,
    })
    .returning();

  return c.json(log, 201);
};

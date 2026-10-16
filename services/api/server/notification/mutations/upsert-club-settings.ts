import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organizationNotificationSettings } from "../../../db/schema/notification/schema";
import { upsertClubNotificationSettingsValidator } from "../validators";
import { assertOrgAdmin } from "../../../middleware/org-member";

export const upsertClubSettings = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof upsertClubNotificationSettingsValidator>;

  const isOrgAdmin = await assertOrgAdmin(currentUser.id, body.organizationId);
  if (!isOrgAdmin && currentUser.role !== "admin") {
    return c.json(
      { error: "Forbidden", message: "Not authorized to update notification settings for this organization" },
      403,
    );
  }

  const values = {
    streakWarning: body.streakWarning,
    challengeAssigned: body.challengeAssigned,
    matchRequestUpdate: body.matchRequestUpdate,
    matchLiked: body.matchLiked,
    newMessage: body.newMessage,
    bookingReminder: body.bookingReminder,
    classReminder: body.classReminder,
    coachMessage: body.coachMessage,
    cotisationRequestEmail: body.cotisationRequestEmail,
    cotisationReminderEmail: body.cotisationReminderEmail,
    invitationAccepted: body.invitationAccepted,
    clubAnnouncement: body.clubAnnouncement,
    memberAlertDigestEmail: body.memberAlertDigestEmail,
  };

  const [updated] = await db
    .insert(organizationNotificationSettings)
    .values({ organizationId: body.organizationId, ...values })
    .onConflictDoUpdate({
      target: organizationNotificationSettings.organizationId,
      set: values,
    })
    .returning();

  return c.json(updated);
};

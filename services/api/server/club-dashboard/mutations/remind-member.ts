import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { assertClubAdmin } from "../../../middleware/club-admin";
import { isOrgMember } from "../../../middleware/org-member";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";
import { remindMemberValidator } from "../validators";

export const remindMember = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof remindMemberValidator>;

  const isAdmin = await assertClubAdmin(currentUser.id, validated.organizationId);
  if (!isAdmin) {
    return c.json({ error: "Forbidden", message: "Club admin access required" }, 403);
  }

  const memberExists = await isOrgMember(validated.userId, validated.organizationId);
  if (!memberExists) {
    return c.json({ error: "BadRequest", message: "This user is not a member of this club" }, 400);
  }

  await sendNotificationToUser({
    userId: validated.userId,
    type: "club_announcement",
    title: "Rappel du club",
    body: validated.message,
  });

  return c.json({ success: true });
};

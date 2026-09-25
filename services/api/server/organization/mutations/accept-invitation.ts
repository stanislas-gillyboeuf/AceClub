import { Context } from "hono";
import { eq } from "drizzle-orm";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { invitationIdValidator } from "../validators";
import { auth } from "../../../auth";
import { invalidateUserClubIds, notFound } from "../../../lib/club-access";
import { db } from "../../../db";
import { member, invitation, organization } from "../../../db/schema/auth/schema";
import { userPreference } from "../../../db/schema/user-preference/schema";
import { sendNotificationToUser } from "../../../services/expo-push/notification-service";
import { isInvitationAcceptable } from "../lib/access-rules";

export const acceptInvitation = async (c: Context<HonoContext>) => {
  try {
    const authUser = c.get("user")!;
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof invitationIdValidator>;

    // Get invitation details to know the new organization and inviter
    const [inv] = await db
      .select({
        organizationId: invitation.organizationId,
        inviterId: invitation.inviterId,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      })
      .from(invitation)
      .where(eq(invitation.id, validated.invitationId))
      .limit(1);

    // Checked BEFORE touching any membership: someone else's (or a stale) invitation must not
    // cost the caller their current club.
    if (!isInvitationAcceptable(inv, authUser.email)) {
      return notFound(c);
    }

    const newOrganizationId = inv.organizationId;

    // Remove user from all current clubs (user can only have one club)
    await db.delete(member).where(eq(member.userId, authUser.id));
    await invalidateUserClubIds(authUser.id);

    // Update user preferences to point to the new organization
    await db
      .update(userPreference)
      .set({
        organizationId: newOrganizationId,
        updatedAt: new Date(),
      })
      .where(eq(userPreference.userId, authUser.id));

    // Accept the invitation (this will create the new membership)
    const result = await auth.api.acceptInvitation({
      body: {
        invitationId: validated.invitationId,
      },
      headers: c.req.raw.headers,
    });
    await invalidateUserClubIds(authUser.id);

    // Recuperer le nom de l'organisation pour la notification
    const [org] = await db
      .select({ name: organization.name })
      .from(organization)
      .where(eq(organization.id, newOrganizationId))
      .limit(1);

    // Envoyer notification a l'inviteur
    sendNotificationToUser({
      userId: inv.inviterId,
      type: "invitation_accepted",
      title: "Nouveau membre ! 🙌",
      body: `${authUser.name ?? "Quelqu'un"} a rejoint ${org?.name ?? "ton club"}`,
      referenceId: newOrganizationId,
      referenceType: "organization",
    }).catch((err) => console.error("Failed to send notification:", err));

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};

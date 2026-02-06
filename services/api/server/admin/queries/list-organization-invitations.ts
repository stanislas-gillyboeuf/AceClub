import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { invitation, user } from "../../../db/schema/auth/schema";
import { eq, sql } from "drizzle-orm";
import { listOrganizationInvitationsValidator } from "../validators";
import { z } from "zod";

export const listOrganizationInvitations = async (
  c: Context<HonoContext>,
) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<
    typeof listOrganizationInvitationsValidator
  >;

  const [invitations, countResult] = await Promise.all([
    db
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        inviterId: invitation.inviterId,
        inviterName: user.name,
        inviterEmail: user.email,
      })
      .from(invitation)
      .leftJoin(user, eq(invitation.inviterId, user.id))
      .where(eq(invitation.organizationId, validated.organizationId))
      .orderBy(invitation.createdAt),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(invitation)
      .where(eq(invitation.organizationId, validated.organizationId)),
  ]);

  return c.json({
    invitations,
    total: countResult[0]?.count ?? 0,
  });
};

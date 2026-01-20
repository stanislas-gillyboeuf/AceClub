import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createInvitationValidator } from "../validators";
import { auth } from "../../../auth";
import { db } from "../../../db";
import { organization, user } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const createInvitation = async (c: Context<HonoContext>) => {
    try {
        // @ts-ignore
        const validated = c.req.valid("json") as z.infer<typeof createInvitationValidator>;


        const checkInvitation = await db.query.invitation.findFirst({
            where: eq(user.email, validated.email),
        });

        if (checkInvitation) {
            return c.json({ error: "User already has an invitation" }, 400);
        }

        if (validated.organizationId) {
            const checkOrganization = await db.query.organization.findFirst({
                where: eq(organization.id, validated.organizationId),
            });

            if (!checkOrganization) {
                return c.json({ error: "Organization not found" }, 404);
            }
        }

        const result = await auth.api.createInvitation({
            body: {
                email: validated.email,
                role: validated.role as "member" | "admin" | "owner",
                organizationId: validated.organizationId,
                resend: validated.resend,
            },
            headers: c.req.raw.headers,
        });

        return c.json(result);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

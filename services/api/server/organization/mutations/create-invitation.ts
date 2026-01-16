import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { createInvitationValidator } from "../validators";
import { auth } from "../../../auth";

export const createInvitation = async (c: Context<HonoContext>) => {
    try {
        // @ts-ignore
        const validated = c.req.valid("json") as z.infer<typeof createInvitationValidator>;

        const result = await auth.api.createInvitation({
            body: {
                email: validated.email,
                role: validated.role,
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

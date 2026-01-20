import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { invitationIdValidator } from "../validators";
import { auth } from "../../../auth";

export const acceptInvitation = async (c: Context<HonoContext>) => {
    try {
        // @ts-ignore
        const validated = c.req.valid("json") as z.infer<typeof invitationIdValidator>;

        const result = await auth.api.acceptInvitation({
            body: {
                invitationId: validated.invitationId,
            },
            headers: c.req.raw.headers,
        });

        return c.json(result);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

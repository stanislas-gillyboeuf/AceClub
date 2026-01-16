import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { listInvitationsValidator } from "../validators";
import { auth } from "../../../auth";

export const listInvitations = async (c: Context<HonoContext>) => {
    try {
        // @ts-ignore
        const validated = c.req.valid("query") as z.infer<typeof listInvitationsValidator>;

        const result = await auth.api.listInvitations({
            query: {
                organizationId: validated.organizationId,
            },
            headers: c.req.raw.headers,
        });

        return c.json(result);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

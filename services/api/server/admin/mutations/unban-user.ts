import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { unbanUserValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const unbanUser = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('json') as z.infer<typeof unbanUserValidator>;

    const unbannedUser = await auth.api.unbanUser({
        body: {
            userId: validated.userId,
        },
        headers: c.req.raw.headers,
    });

    return c.json(unbannedUser);
};
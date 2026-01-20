import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { listUserSessionsValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const listUserSessions = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('body') as z.infer<typeof listUserSessionsValidator>;

    const listUserSessionsResponse = await auth.api.listUserSessions({
        body: {
            userId: validated.userId,
        },
        headers: c.req.raw.headers,
    });

    return c.json(listUserSessionsResponse);
};
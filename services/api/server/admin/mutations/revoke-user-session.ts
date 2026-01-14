import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { revokeUserSessionValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const revokeUserSession = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('body') as z.infer<typeof revokeUserSessionValidator>;

    const revokedUserSession = await auth.api.revokeUserSession({
        body: {
            sessionToken: validated.sessionToken,
        },
        headers: c.req.raw.headers,
    });

    return c.json(revokedUserSession);
};
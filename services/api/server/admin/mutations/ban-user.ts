import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { banUserValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const banUser = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('body') as z.infer<typeof banUserValidator>;

    const bannedUser = await auth.api.banUser({
        body: {
            userId: validated.userId,
            banReason: validated.banReason,
            banExpiresIn: validated.banExpiresIn,
        },
        headers: c.req.raw.headers,
    });

    return c.json(bannedUser);
};
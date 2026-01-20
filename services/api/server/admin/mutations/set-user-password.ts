import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { setUserPasswordValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const setUserPassword = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('json') as z.infer<typeof setUserPasswordValidator>;

    const setUserPasswordResponse = await auth.api.setUserPassword({
        body: {
            userId: validated.userId,
            newPassword: validated.newPassword,
        },
        headers: c.req.raw.headers,
    });

    return c.json(setUserPasswordResponse);
};
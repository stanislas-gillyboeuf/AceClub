import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { updateUserValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const updateUser = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('body') as z.infer<typeof updateUserValidator>;

    const updatedUser = await auth.api.adminUpdateUser({
        body: {
            userId: validated.userId,
            data: validated.data,
        },
        headers: c.req.raw.headers,
    });

    return c.json(updatedUser);
};
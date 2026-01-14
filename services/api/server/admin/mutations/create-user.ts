import { Context } from "hono";
import { auth } from "../../../auth";
import { HonoContext } from "../../../types/hono";
import { createUserValidator } from "../validators";
import { z } from "zod";

export const createUser = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('body') as z.infer<typeof createUserValidator>;

    const createdUser = await auth.api.createUser({
        body: {
            email: validated.email,
            password: validated.password,
            name: validated.name,
            role: validated.role as "user" | "admin" | ("user" | "admin")[] | undefined,
            data: validated.data,
        },
        headers: c.req.raw.headers,
    });

    return c.json(createdUser);
};
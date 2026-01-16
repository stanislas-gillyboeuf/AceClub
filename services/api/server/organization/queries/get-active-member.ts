import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { auth } from "../../../auth";

export const getActiveMember = async (c: Context<HonoContext>) => {
    try {
        const result = await auth.api.getActiveMember({
            headers: c.req.raw.headers,
        });

        return c.json(result);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

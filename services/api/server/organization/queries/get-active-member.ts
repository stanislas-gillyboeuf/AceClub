import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { auth } from "../../../auth";

export const getActiveMember = async (c: Context<HonoContext>) => {
    try {
        const result = await auth.api.getActiveMember({
            headers: c.req.raw.headers,
        });

        console.log("📦 getActiveMember response:", JSON.stringify(result, null, 2));
        return c.json(result);
    } catch (error) {
        console.log("❌ getActiveMember error:", (error as Error).message);
        return c.json({ error: (error as Error).message }, 500);
    }
};

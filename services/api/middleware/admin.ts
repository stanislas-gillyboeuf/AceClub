import { Context, Next } from "hono";
import type { HonoContext } from "../types/hono";

export const isAdmin = async (c: Context<HonoContext>, next: Next) => {
    const user = c.get("user");

    if (user?.role !== "admin") {
        return c.json({ error: "Unauthorized", message: "Admin required" }, 401);
    }

    await next();
};
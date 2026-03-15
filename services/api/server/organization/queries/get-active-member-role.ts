import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { auth } from "../../../auth";

export const getActiveMemberRole = async (c: Context<HonoContext>) => {
  try {
    const result = await auth.api.getActiveMemberRole({
      headers: c.req.raw.headers,
    });

    return c.json(result);
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (
      errorMessage.includes("No active organization") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("not a member")
    ) {
      return c.json(null);
    }

    return c.json({ error: errorMessage }, 500);
  }
};

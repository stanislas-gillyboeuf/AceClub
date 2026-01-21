import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { removeMemberValidator } from "../validators";
import { auth } from "../../../auth";

export const removeMember = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof removeMemberValidator>;

    const result = await auth.api.removeMember({
      body: {
        memberIdOrEmail: validated.memberIdOrEmail,
        organizationId: validated.organizationId,
      },
      headers: c.req.raw.headers,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};

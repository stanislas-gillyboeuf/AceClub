import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { updateMemberRoleValidator } from "../validators";
import { auth } from "../../../auth";

export const updateMemberRole = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateMemberRoleValidator>;

    const result = await auth.api.updateMemberRole({
      body: {
        role: validated.role,
        memberId: validated.memberId,
        organizationId: validated.organizationId,
      },
      headers: c.req.raw.headers,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};

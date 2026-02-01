import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { addMemberValidator } from "../validators";
import { auth } from "../../../auth";

export const addMember = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof addMemberValidator>;

  const data = await auth.api.addMember({
    body: {
      userId: validated.userId || "",
      role: validated.role as "member" | "admin" | "owner" | ("member" | "admin" | "owner")[],
      organizationId: validated.organizationId,
      teamId: validated.teamId,
    },
    headers: c.req.raw.headers,
  });
  return c.json(data);
};

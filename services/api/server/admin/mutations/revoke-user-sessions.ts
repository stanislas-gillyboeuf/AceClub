import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { revokeUserSessionsValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const revokeUserSessions = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof revokeUserSessionsValidator>;

  const revokedUserSessions = await auth.api.revokeUserSessions({
    body: {
      userId: validated.userId,
    },
    headers: c.req.raw.headers,
  });

  return c.json(revokedUserSessions);
};

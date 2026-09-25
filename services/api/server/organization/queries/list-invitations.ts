import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { listInvitationsValidator } from "../validators";
import { auth } from "../../../auth";
import { forbidden, isSuperAdmin } from "../../../lib/club-access";
import { assertOrgAdmin } from "../../../middleware/org-member";
import { httpStatusFromAuthError } from "../lib/access-rules";

export const listInvitations = async (c: Context<HonoContext>) => {
  try {
    const currentUser = c.get("user")!;
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof listInvitationsValidator>;

    // The list exposes invited email addresses: owners/admins of the club only.
    if (!isSuperAdmin(currentUser)) {
      const allowed = validated.organizationId
        ? await assertOrgAdmin(currentUser.id, validated.organizationId)
        : false;
      if (!allowed) return forbidden(c);
    }

    const result = await auth.api.listInvitations({
      query: {
        organizationId: validated.organizationId,
      },
      headers: c.req.raw.headers,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, httpStatusFromAuthError(error));
  }
};

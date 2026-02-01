import { auth } from "../../../auth";
import { HonoContext } from "../../../types/hono";
import { Context } from "hono";
import { getFullOrganizationValidator } from "../validators";

export const getFullOrganization = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof getFullOrganizationValidator>;
  const data = await auth.api.getFullOrganization({
    query: {
      organizationId: validated.organizationId,
      organizationSlug: validated.organizationSlug,
      membersLimit: validated.membersLimit,
    },
    headers: c.req.raw.headers,
  });
  console.log("getFullOrganization members:", JSON.stringify(data?.members, null, 2));
  return c.json(data);
};

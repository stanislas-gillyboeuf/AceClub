import { auth } from "../../../auth";
import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { setActiveOrganizationValidator } from "../validators";

export const setActive = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof setActiveOrganizationValidator>;
    const data = await auth.api.setActiveOrganization({
        body: {
            organizationId: validated.organizationId,
            organizationSlug: validated.organizationSlug,
        },
        headers: c.req.raw.headers,
    });
    return c.json(data);
};
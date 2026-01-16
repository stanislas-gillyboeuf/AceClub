import { Context } from "hono";

import { HonoContext } from "../../../types/hono";
import { updateOrganizationValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";
export const updateOrganization = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof updateOrganizationValidator>;

    const data = await auth.api.updateOrganization({
        body: {
            data: validated.data,
            organizationId: validated.organizationId,
        },
        headers: c.req.raw.headers,
    });
    return c.json(data);
};
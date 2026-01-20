import { HonoContext } from "../../../types/hono";
import { Context } from "hono";
import { z } from "zod";
import { deleteOrganizationValidator } from "../validators";
import { auth } from "../../../auth";

export const deleteOrganization = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid("json") as z.infer<typeof deleteOrganizationValidator>;
    const data = await auth.api.deleteOrganization({
        body: {
            organizationId: validated.organizationId,
        },
        headers: c.req.raw.headers,
    });
    return c.json(data);
};
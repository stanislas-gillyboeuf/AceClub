import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { listMembersValidator } from "../validators";
import { auth } from "../../../auth";

export const listMembers = async (c: Context<HonoContext>) => {
    try {
        // @ts-ignore
        const validated = c.req.valid("query") as z.infer<typeof listMembersValidator>;

        const result = await auth.api.listMembers({
            query: {
                organizationId: validated.organizationId,
                limit: validated.limit,
                offset: validated.offset,
                sortBy: validated.sortBy,
                sortDirection: validated.sortDirection,
                filterField: validated.filterField,
                filterOperator: validated.filterOperator,
                filterValue: validated.filterValue,
            },
            headers: c.req.raw.headers,
        });

        return c.json(result);
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
};

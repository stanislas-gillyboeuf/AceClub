import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { auth } from "../../../auth";
import { listUsersValidator } from "../validators";
import { z } from "zod";



export const listUsers = async (c: Context<HonoContext>) => {
    // @ts-ignore
    const validated = c.req.valid('query') as z.infer<typeof listUsersValidator>;

    const listUsersResponse = await auth.api.listUsers({
        query: {
            searchValue: validated.searchValue,
            searchField: validated.searchField,
            searchOperator: validated.searchOperator,
            limit: validated.limit,
            offset: validated.offset,
            sortBy: validated.sortBy,
            sortDirection: validated.sortDirection,
            filterField: validated.filterField,
            filterValue: validated.filterValue,
            filterOperator: validated.filterOperator,
        },
        headers: c.req.raw.headers,
    });
        return c.json(listUsersResponse);
};
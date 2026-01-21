import { Context } from "hono";
import { auth } from "../../../auth";
import { HonoContext } from "../../../types/hono";

export const listOrganizationsUser = async (c: Context<HonoContext>) => {
  const data = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });
  return c.json(data);
};

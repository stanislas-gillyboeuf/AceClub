import { Context } from "hono";
import { auth } from "../../../auth";
import { HonoContext } from "../../../types/hono";

export const listOrganizationsUser = async (c: Context<HonoContext>) => {
  const data = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });
  const filtered = data.filter((org) => {
    if (!org.metadata) return true;
    try {
      const meta =
        typeof org.metadata === "string"
          ? JSON.parse(org.metadata)
          : org.metadata;
      return !meta.hidden;
    } catch {
      return true;
    }
  });
  return c.json(filtered);
};

import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";

export const me = async (c: Context<HonoContext>) => {
  const user = c.get("user");

  return c.json({
    id: user!.id,
    name: user!.name,
    email: user!.email,
    emailVerified: user!.emailVerified,
    image: user!.image,
    createdAt: user!.createdAt,
    updatedAt: user!.updatedAt,
    role: user!.role,
    banned: user!.banned,
    banReason: user!.banReason,
    banExpires: user!.banExpires,
  });
};

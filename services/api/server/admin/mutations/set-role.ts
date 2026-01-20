import { Context } from "hono";
import { HonoContext } from "../../../types/hono";
import { setRoleValidator } from "../validators";
import { z } from "zod";
import { auth } from "../../../auth";

export const setRole = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof setRoleValidator>;

<<<<<<< HEAD
    const setRoleResponse = await auth.api.setRole({
        body: {
            userId: validated.userId,
            role: validated.role as "user" | "admin" | ("user" | "admin")[],
        },
        headers: c.req.raw.headers,
    });
    return c.json(setRoleResponse);
};
=======
  const setRoleResponse = await auth.api.setRole({
    body: {
      userId: validated.userId,
      role: validated.role as "user" | "admin" | ("user" | "admin")[],
    },
    headers: c.req.raw.headers,
  });

  console.log(setRoleResponse);
  return c.json(setRoleResponse);
};
>>>>>>> 88c09d3 (feature/ci-config)

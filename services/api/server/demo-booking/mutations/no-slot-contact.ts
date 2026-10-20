import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { noSlotContactValidator } from "../validators";
import { checkDemoBookingWriteRateLimit, demoBookingClientIp } from "../lib/rate-limit";
import { getOwnerEmail } from "../lib/owner";
import { sendNoSlotContactEmail } from "../lib/emails";

export const noSlotContact = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof noSlotContactValidator>;

  const ip = demoBookingClientIp(c.req.header("x-forwarded-for"), c.req.header("x-real-ip"));
  const rateLimit = checkDemoBookingWriteRateLimit(ip);
  if (!rateLimit.allowed) {
    return c.json(
      { error: "TooManyRequests", message: "Trop de tentatives, réessaie dans un instant" },
      429,
    );
  }

  const ownerEmail = await getOwnerEmail();
  if (ownerEmail) {
    await sendNoSlotContactEmail(ownerEmail, body.email);
  }

  return c.json({ ok: true });
};

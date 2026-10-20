import { Context } from "hono";
import { z } from "zod";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { demoBooking } from "../../../db/schema";
import { listDemoBookingsValidator } from "../validators";

export const listAdminBookings = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listDemoBookingsValidator>;

  const bookings = query.upcoming
    ? await db
        .select()
        .from(demoBooking)
        .where(and(eq(demoBooking.status, "confirmed"), gt(demoBooking.startAt, new Date())))
        .orderBy(asc(demoBooking.startAt))
    : await db.select().from(demoBooking).orderBy(desc(demoBooking.startAt));

  return c.json({ bookings });
};

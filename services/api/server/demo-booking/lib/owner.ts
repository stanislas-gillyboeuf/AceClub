import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { googleCalendarConnection, user } from "../../../db/schema";

/** The admin who connected the calendar is the single owner — their email is where every
 * owner-facing notification (new booking, cancellation, connection error) is sent. */
export async function getOwnerEmail(): Promise<string | null> {
  const [row] = await db
    .select({ connectedByUserId: googleCalendarConnection.connectedByUserId })
    .from(googleCalendarConnection)
    .where(eq(googleCalendarConnection.id, "singleton"))
    .limit(1);

  if (!row?.connectedByUserId) return null;

  const [owner] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, row.connectedByUserId))
    .limit(1);

  return owner?.email ?? null;
}

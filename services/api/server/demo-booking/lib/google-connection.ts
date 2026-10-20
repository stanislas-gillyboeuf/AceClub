import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { googleCalendarConnection } from "../../../db/schema";
import { decrypt } from "../../../lib/encryption";
import { sendEmail } from "../../../services/mailer";
import { getOwnerEmail } from "./owner";

export interface ActiveGoogleConnection {
  refreshToken: string;
  calendarId: string;
}

/** Returns null when there is no connection, or it's already flagged as broken — callers must
 * then treat the calendar as unavailable (never show slots that might conflict). */
export async function getActiveGoogleConnection(): Promise<ActiveGoogleConnection | null> {
  const [row] = await db
    .select()
    .from(googleCalendarConnection)
    .where(eq(googleCalendarConnection.id, "singleton"))
    .limit(1);

  if (!row || row.status !== "connected") return null;

  return { refreshToken: decrypt(row.encryptedRefreshToken), calendarId: row.calendarId };
}

/** Marks the connection as broken and alerts the owner — called whenever Google rejects the
 * refresh token (revoked access, expired test-mode grant, etc). */
export async function markGoogleConnectionError(message: string): Promise<void> {
  const [row] = await db
    .select({ id: googleCalendarConnection.id, status: googleCalendarConnection.status })
    .from(googleCalendarConnection)
    .where(eq(googleCalendarConnection.id, "singleton"))
    .limit(1);

  if (!row) return;

  const alreadyInError = row.status === "error";

  await db
    .update(googleCalendarConnection)
    .set({ status: "error", lastErrorMessage: message, lastErrorAt: new Date() })
    .where(eq(googleCalendarConnection.id, "singleton"));

  if (alreadyInError) return;

  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) return;

  await sendEmail({
    to: ownerEmail,
    subject: "⚠️ Connexion Google Agenda interrompue",
    html: `<p>La connexion à Google Agenda pour la prise de RDV démo a été interrompue (${message}).</p><p>Reconnecte ton agenda depuis le dashboard admin — en attendant, la page /demo n'affichera aucun créneau.</p>`,
    text: `La connexion à Google Agenda pour la prise de RDV démo a été interrompue (${message}). Reconnecte ton agenda depuis le dashboard admin — en attendant, la page /demo n'affichera aucun créneau.`,
  });
}

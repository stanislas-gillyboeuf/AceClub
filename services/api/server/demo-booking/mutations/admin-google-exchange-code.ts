import { Context } from "hono";
import { z } from "zod";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { googleCalendarConnection } from "../../../db/schema";
import { exchangeCodeForTokens } from "../../../lib/google-calendar";
import { encrypt } from "../../../lib/encryption";
import { exchangeGoogleCodeValidator } from "../validators";

/**
 * Called from the web admin's OAuth callback page (same origin the admin is authenticated on —
 * the Google redirect itself cannot carry the admin's session cookie across to api.ace-club.app),
 * which forwards the `code` here once it has it.
 */
export const exchangeGoogleCode = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const body = c.req.valid("json") as z.infer<typeof exchangeGoogleCodeValidator>;

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(body.code);
  } catch {
    return c.json({ error: "BadRequest", message: "Échec de l'échange du code Google" }, 400);
  }

  if (!tokens.refreshToken) {
    return c.json(
      { error: "BadRequest", message: "Google n'a pas renvoyé de refresh token" },
      400,
    );
  }

  const encryptedRefreshToken = encrypt(tokens.refreshToken);

  await db
    .insert(googleCalendarConnection)
    .values({
      id: "singleton",
      encryptedRefreshToken,
      calendarId: "primary",
      connectedByUserId: currentUser.id,
      status: "connected",
      lastErrorMessage: null,
      lastErrorAt: null,
    })
    .onConflictDoUpdate({
      target: googleCalendarConnection.id,
      set: {
        encryptedRefreshToken,
        connectedByUserId: currentUser.id,
        status: "connected",
        lastErrorMessage: null,
        lastErrorAt: null,
      },
    });

  return c.json({ ok: true });
};

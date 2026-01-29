import { SignJWT, importPKCS8 } from "jose";

// Configuration APNs (utiliser des variables d'environnement)
const APNS_TEAM_ID = process.env.APNS_TEAM_ID!;
const APNS_KEY_ID = process.env.APNS_KEY_ID!;
const APNS_SIGNING_KEY = process.env.APNS_SIGNING_KEY!;
const APNS_BUNDLE_ID = process.env.APNS_BUNDLE_ID!;
const APNS_HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.push.apple.com"
    : "https://api.sandbox.push.apple.com";

// Cache pour le JWT (valide 1 heure, on le renouvelle toutes les 50 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAPNsToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Retourner le token cache s'il est encore valide (avec 10 min de marge)
  if (cachedToken && cachedToken.expiresAt > now + 600) {
    return cachedToken.token;
  }

  // Generer un nouveau token JWT
  const privateKey = await importPKCS8(APNS_SIGNING_KEY, "ES256");

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: APNS_KEY_ID })
    .setIssuer(APNS_TEAM_ID)
    .setIssuedAt(now)
    .sign(privateKey);

  // Cache le token pour 50 minutes
  cachedToken = {
    token,
    expiresAt: now + 3000, // 50 minutes
  };

  return token;
}

export interface PushNotificationPayload {
  deviceToken: string;
  title: string;
  body: string;
  badge?: number;
  sound?: string;
  data?: Record<string, string>;
}

export interface APNsResponse {
  success: boolean;
  statusCode?: number;
  reason?: string;
  deviceToken: string;
}

export async function sendPushNotification(
  payload: PushNotificationPayload,
): Promise<APNsResponse> {
  try {
    const token = await getAPNsToken();

    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        badge: payload.badge,
        sound: payload.sound || "default",
      },
      ...payload.data,
    };

    const response = await fetch(
      `${APNS_HOST}/3/device/${payload.deviceToken}`,
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "apns-topic": APNS_BUNDLE_ID,
          "apns-push-type": "alert",
          "apns-priority": "10",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apnsPayload),
      },
    );

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        deviceToken: payload.deviceToken,
      };
    }

    const errorBody = await response.json().catch(() => ({}));
    return {
      success: false,
      statusCode: response.status,
      reason: (errorBody as { reason?: string }).reason || "Unknown error",
      deviceToken: payload.deviceToken,
    };
  } catch (error) {
    console.error("APNs error:", error);
    return {
      success: false,
      reason: error instanceof Error ? error.message : "Unknown error",
      deviceToken: payload.deviceToken,
    };
  }
}

export async function sendPushNotificationBatch(
  payloads: PushNotificationPayload[],
): Promise<APNsResponse[]> {
  const results = await Promise.all(payloads.map(sendPushNotification));
  return results;
}

// Verifier si le token APNs est invalide (pour le desactiver)
export function isInvalidTokenError(reason?: string): boolean {
  return (
    reason === "BadDeviceToken" ||
    reason === "Unregistered" ||
    reason === "DeviceTokenNotForTopic"
  );
}

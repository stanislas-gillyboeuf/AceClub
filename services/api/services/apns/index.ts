import { SignJWT, importPKCS8 } from "jose";
import * as http2 from "http2";

const APNS_TEAM_ID = process.env.APNS_TEAM_ID!;
const APNS_KEY_ID = process.env.APNS_KEY_ID!;
// Convert escaped newlines to actual newlines (env vars often escape them)
const APNS_SIGNING_KEY = process.env.APNS_SIGNING_KEY!.replace(/\\n/g, "\n");
const APNS_BUNDLE_ID = process.env.APNS_BUNDLE_ID!;
const APNS_HOST =
  process.env.APNS_USE_SANDBOX === "true"
    ? "api.sandbox.push.apple.com"
    : "api.push.apple.com";

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

function sendHttp2Request(
  host: string,
  path: string,
  headers: Record<string, string>,
  body: string
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${host}`);

    client.on("error", (err) => {
      client.close();
      reject(err);
    });

    const req = client.request({
      ":method": "POST",
      ":path": path,
      ...headers,
    });

    req.setEncoding("utf8");

    let responseBody = "";
    let statusCode = 0;

    req.on("response", (headers) => {
      statusCode = headers[":status"] as number;
    });

    req.on("data", (chunk) => {
      responseBody += chunk;
    });

    req.on("end", () => {
      client.close();
      resolve({ statusCode, body: responseBody });
    });

    req.on("error", (err) => {
      client.close();
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<APNsResponse> {
  console.log(
    `[APNs] Sending notification to device: ${payload.deviceToken.substring(0, 20)}...`
  );
  console.log(`[APNs] Using host: ${APNS_HOST}`);

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

    const body = JSON.stringify(apnsPayload);
    console.log(`[APNs] Payload:`, body);

    const response = await sendHttp2Request(
      APNS_HOST,
      `/3/device/${payload.deviceToken}`,
      {
        authorization: `bearer ${token}`,
        "apns-topic": APNS_BUNDLE_ID,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body
    );

    if (response.statusCode === 200) {
      console.log(`[APNs] Success! Status: ${response.statusCode}`);
      return {
        success: true,
        statusCode: response.statusCode,
        deviceToken: payload.deviceToken,
      };
    }

    const errorBody = response.body ? JSON.parse(response.body) : {};
    const reason = errorBody.reason || "Unknown error";
    console.error(
      `[APNs] Failed! Status: ${response.statusCode}, Reason: ${reason}`
    );
    return {
      success: false,
      statusCode: response.statusCode,
      reason,
      deviceToken: payload.deviceToken,
    };
  } catch (error) {
    console.error("[APNs] Exception:", error);
    return {
      success: false,
      reason: error instanceof Error ? error.message : "Unknown error",
      deviceToken: payload.deviceToken,
    };
  }
}

export async function sendPushNotificationBatch(
  payloads: PushNotificationPayload[]
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

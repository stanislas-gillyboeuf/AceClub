const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
].join(" ");

function getRedirectUri(): string {
  // Must land on the web app's own origin, not the API's: Google's redirect is a top-level
  // browser navigation and cannot carry the admin's api.ace-club.app session cookie — the web
  // callback page forwards the code to the API itself once it has it (see
  // server/demo-booking/mutations/admin-google-exchange-code.ts). BETTER_AUTH_URL points at the
  // API itself in production (Better Auth's own routes live there), so it can't be reused here.
  const base = process.env.DEMO_BOOKING_PUBLIC_URL || "https://ace-club.app";
  return `${base}/dashboard/demo-booking/google-callback`;
}

function getClientCredentials(): { clientId: string; clientSecret: string } {
  // Dedicated OAuth client for Calendar access — separate from GOOGLE_CLIENT_ID/SECRET, which
  // Better Auth uses for "Sign in with Google" and carries different scopes/consent.
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CALENDAR_CLIENT_ID / GOOGLE_CALENDAR_CLIENT_SECRET are not configured");
  }
  return { clientId, clientSecret };
}

export function getGoogleCalendarAuthUrl(): string {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number;
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresInSeconds: data.expires_in,
  };
}

export class GoogleCalendarAuthError extends Error {}

async function getFreshAccessToken(refreshToken: string): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (res.status === 400 || res.status === 401) {
    throw new GoogleCalendarAuthError(`Google refresh token rejected: ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface BusyInterval {
  start: string;
  end: string;
}

export async function getFreeBusy(
  refreshToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<BusyInterval[]> {
  const accessToken = await getFreshAccessToken(refreshToken);
  const res = await fetch(`${CALENDAR_API_BASE}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  if (res.status === 401 || res.status === 403) {
    throw new GoogleCalendarAuthError(`Google freeBusy auth error: ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(`Google freeBusy failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    calendars: Record<string, { busy: BusyInterval[] }>;
  };
  return data.calendars[calendarId]?.busy ?? [];
}

export interface CreateEventParams {
  startAt: Date;
  endAt: Date;
  attendeeEmail: string;
  attendeeName: string;
  summary: string;
  description: string;
}

export interface CreatedEvent {
  eventId: string;
  meetLink: string | null;
}

export async function createEvent(
  refreshToken: string,
  calendarId: string,
  params: CreateEventParams,
): Promise<CreatedEvent> {
  const accessToken = await getFreshAccessToken(refreshToken);
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startAt.toISOString() },
        end: { dateTime: params.endAt.toISOString() },
        attendees: [{ email: params.attendeeEmail, displayName: params.attendeeName }],
        conferenceData: {
          createRequest: {
            requestId: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  if (res.status === 401 || res.status === 403) {
    throw new GoogleCalendarAuthError(`Google createEvent auth error: ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(`Google createEvent failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
  };
  const meetLink =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ??
    null;
  return { eventId: data.id, meetLink };
}

export async function updateEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string,
  params: { startAt: Date; endAt: Date },
): Promise<void> {
  const accessToken = await getFreshAccessToken(refreshToken);
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: { dateTime: params.startAt.toISOString() },
        end: { dateTime: params.endAt.toISOString() },
      }),
    },
  );
  if (res.status === 401 || res.status === 403) {
    throw new GoogleCalendarAuthError(`Google updateEvent auth error: ${res.status}`);
  }
  if (!res.ok && res.status !== 404) {
    throw new Error(`Google updateEvent failed: ${res.status} ${await res.text()}`);
  }
}

export async function deleteEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const accessToken = await getFreshAccessToken(refreshToken);
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  // 404/410 means it's already gone — not an error for our purposes.
  if (res.status === 401 || res.status === 403) {
    throw new GoogleCalendarAuthError(`Google deleteEvent auth error: ${res.status}`);
  }
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google deleteEvent failed: ${res.status} ${await res.text()}`);
  }
}

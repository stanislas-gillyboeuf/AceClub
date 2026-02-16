/**
 * Auth utilities for API requests.
 * Supports cookies (Better Auth Expo) and Bearer token.
 */

import * as SecureStore from "expo-secure-store";
import { authClient } from "@/lib/auth-client";

const BEARER_TOKEN_KEY = "aceclub_bearer_token";
const COOKIE_STORAGE_KEY = "aceclub_cookie";

/** AuthClient extended by @better-auth/expo with getCookie */
interface AuthClientWithCookie {
  getCookie?: () => string;
}

function getCookieFromAuthClient(): string | null {
  const client = authClient as AuthClientWithCookie;
  const cookie = client.getCookie?.();
  if (!cookie?.trim()) return null;
  return cookie.trim().replace(/^;\s*/, "");
}

function getCookieFromSecureStore(): string | null {
  try {
    const raw = SecureStore.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, { value: string; expires?: string }>;
    const now = Date.now();

    return Object.entries(parsed)
      .filter(([, v]) => !v.expires || new Date(v.expires).getTime() > now)
      .map(([key, v]) => `${key}=${v.value}`)
      .join("; ")
      .trim() || null;
  } catch {
    return null;
  }
}

async function getBearerToken(): Promise<string | null> {
  return SecureStore.getItemAsync(BEARER_TOKEN_KEY);
}

/**
 * Returns auth headers for API requests.
 * Order: cookies (authClient) → Bearer token → legacy SecureStore cookies.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  const cookie = getCookieFromAuthClient() ?? getCookieFromSecureStore();
  if (cookie) {
    headers["Cookie"] = cookie;
    return headers;
  }

  const bearerToken = await getBearerToken();
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  return headers;
}

/**
 * Auth params for WebSocket connection.
 */
export type WebSocketAuth = { token: string } | { cookie: string };

export async function getAuthForWebSocket(): Promise<WebSocketAuth | null> {
  const cookie = getCookieFromAuthClient() ?? getCookieFromSecureStore();
  if (cookie) return { cookie };

  const bearerToken = await getBearerToken();
  if (bearerToken) return { token: bearerToken };

  return null;
}

export async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY);
  }
}

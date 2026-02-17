/**
 * Auth utilities for API requests.
 * Strategy: cookies (Better Auth Expo plugin) primary, bearer token fallback.
 * Bearer token is captured globally via fetchOptions.onSuccess in auth-client.ts.
 */

import * as SecureStore from "expo-secure-store";
import { authClient } from "@/lib/auth-client";

const BEARER_TOKEN_KEY = "aceclub_bearer_token";

/**
 * Returns auth headers for custom API requests.
 * 1. Try cookies from authClient.getCookie() (Better Auth Expo plugin)
 * 2. Fall back to bearer token from SecureStore (captured via fetchOptions.onSuccess)
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // 1. Try cookie from expo plugin
  const cookie = (authClient as { getCookie?: () => string }).getCookie?.();
  if (cookie?.trim()) {
    return { Cookie: cookie.trim().replace(/^;\s*/, "") };
  }

  // 2. Fall back to bearer token
  const token = await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  return {};
}

export async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(BEARER_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY);
  }
}

/**
 * Clears ALL local auth data:
 * - Bearer token
 * - Expo client cookies (workaround for better-auth/better-auth#5868)
 * - Expo client cached session data
 */
export async function clearAuthData(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(BEARER_TOKEN_KEY),
    SecureStore.deleteItemAsync("aceclub_cookie"),
    SecureStore.deleteItemAsync("aceclub_session_data"),
  ]);
}

/** Auth params for WebSocket connection. */
export type WebSocketAuth = { token: string } | { cookie: string };

export async function getAuthForWebSocket(): Promise<WebSocketAuth | null> {
  const cookie = (authClient as { getCookie?: () => string }).getCookie?.();
  if (cookie?.trim()) return { cookie: cookie.trim().replace(/^;\s*/, "") };

  const token = await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
  if (token) return { token };

  return null;
}

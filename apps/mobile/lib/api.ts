import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getAuthCookie(): Promise<string | null> {
  try {
    const raw = await SecureStore.getItemAsync("mobile_cookie");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<
      string,
      { value: string; expires?: string }
    >;
    return Object.entries(parsed)
      .filter(([, v]) => !v.expires || new Date(v.expires) > new Date())
      .map(([key, v]) => `${key}=${v.value}`)
      .join("; ");
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
  }
): Promise<T> {
  let url = `${BASE_URL}/api${path}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};

  const cookie = await getAuthCookie();
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => request<T>("GET", path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>("POST", path, { body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>("PUT", path, { body }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>("DELETE", path, { body }),
};

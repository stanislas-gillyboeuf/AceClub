/**
 * API client for AceClub backend.
 * Uses cookies (Better Auth Expo) or Bearer token for auth.
 */

import { Platform } from "react-native";
import {
  getAuthHeaders,
  getAuthForWebSocket,
  setAuthToken,
  type WebSocketAuth,
} from "@/lib/auth-api";

function getBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && Platform.OS === "android") {
    return envUrl.replace("localhost", "10.0.2.2");
  }
  return envUrl ?? (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");
}

export const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "omit",
};

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

  const headers = await getAuthHeaders();
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...DEFAULT_FETCH_OPTIONS,
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

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(500, "Invalid JSON response");
  }
}

async function uploadMultipart<T>(
  path: string,
  fileField: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<T> {
  const url = `${BASE_URL}/api${path}`;
  const formData = new FormData();
  formData.append(fileField, {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(500, "Invalid JSON response");
  }
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

  uploadMultipart: <T>(
    path: string,
    fileField: string,
    fileUri: string,
    fileName: string,
    mimeType: string
  ) => uploadMultipart<T>(path, fileField, fileUri, fileName, mimeType),
};

export { getAuthHeaders, getAuthForWebSocket, setAuthToken };
export type { WebSocketAuth };

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

export interface ApiErrorContext {
  method: string;
  path: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly context?: ApiErrorContext;

  constructor(status: number, message: string, context?: ApiErrorContext) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.context = context;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "omit",
};

interface RawFetchOptions {
  body?: unknown;
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined>;
}

async function rawFetch<T>(
  method: string,
  path: string,
  options?: RawFetchOptions
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
  let body: BodyInit | undefined;

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  } else if (options?.formData) {
    body = options.formData;
  }

  const response = await fetch(url, {
    ...DEFAULT_FETCH_OPTIONS,
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text, { method, path });
  }

  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(500, "Invalid JSON response", { method, path });
  }
}

function buildUploadFormData(
  fileField: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
  extraFields?: Record<string, string>
): FormData {
  const formData = new FormData();
  formData.append(fileField, {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }
  return formData;
}

export const api = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => rawFetch<T>("GET", path, { params }),

  post: <T>(path: string, body?: unknown) =>
    rawFetch<T>("POST", path, { body }),

  put: <T>(path: string, body?: unknown) =>
    rawFetch<T>("PUT", path, { body }),

  delete: <T>(path: string, body?: unknown) =>
    rawFetch<T>("DELETE", path, { body }),

  uploadMultipart: <T>(
    path: string,
    fileField: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    extraFields?: Record<string, string>
  ) =>
    rawFetch<T>("POST", path, {
      formData: buildUploadFormData(fileField, fileUri, fileName, mimeType, extraFields),
    }),
};

export { getAuthHeaders, getAuthForWebSocket, setAuthToken };
export type { WebSocketAuth };

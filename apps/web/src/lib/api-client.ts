const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `API error: ${res.status}`);
  }

  return res.json();
}

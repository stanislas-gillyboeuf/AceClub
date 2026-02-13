import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { NotificationsResponse } from "@/types/notification";

export function useNotifications(params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ["notifications", params, qs],
    queryFn: () => apiClient<NotificationsResponse>(`/notification${qs ? `?${qs}` : ""}`),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => apiClient<{ count: number }>("/notification/unread-count"),
    refetchInterval: 30000,
  });
}

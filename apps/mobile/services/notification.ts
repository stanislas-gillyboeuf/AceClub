import { api } from "@/lib/api";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface ListNotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

export const notificationService = {
  listNotifications: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) =>
    api.get<ListNotificationsResponse>("/notification/list", {
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      unreadOnly: params?.unreadOnly ?? false,
    }),

  getUnreadCount: () =>
    api.get<{ unreadCount: number }>("/notification/unread-count"),

  markAsRead: (notificationId: string) =>
    api.post<void>(`/notification/${notificationId}/read`),

  registerDeviceToken: (data: { token: string; platform: string }) =>
    api.post<void>("/notification/register-device", data),
};

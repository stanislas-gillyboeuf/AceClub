"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, useUnreadCount } from "@/hooks/use-notification-queries";
import { useMarkRead, useMarkAllRead } from "@/hooks/use-notification-mutations";
import type { Notification } from "@/types/notification";

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMarkRead();

  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => {
        if (!notification.read) {
          markRead.mutate({ notificationId: notification.id });
        }
      }}
    >
      <Card
        className={`transition-colors hover:bg-accent/50 ${!notification.read ? "border-primary/30 bg-primary/5" : ""}`}
      >
        <CardContent className="flex gap-3 p-3">
          <div
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${!notification.read ? "bg-primary/10" : "bg-muted"}`}
          >
            <Bell
              className={`size-4 ${!notification.read ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground">{notification.body}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {!notification.read && <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
        </CardContent>
      </Card>
    </button>
  );
}

export default function NotificationsPage() {
  const { data, isPending } = useNotifications({ limit: 50 });
  const { data: unreadData } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-1 size-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {isPending ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <Bell className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucune notification.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

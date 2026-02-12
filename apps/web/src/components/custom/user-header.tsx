"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/use-notification-queries";

const pageTitles: Record<string, string> = {
  "/app": "Accueil",
  "/app/matches": "Matchs",
  "/app/matches/new": "Nouveau match",
  "/app/discover": "Découvrir",
  "/app/events": "Événements",
  "/app/profile": "Profil",
  "/app/progression": "Progression",
  "/app/leaderboard": "Classement",
  "/app/notifications": "Notifications",
  "/app/settings": "Paramètres",
  "/app/onboarding": "Bienvenue",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check match detail
  if (pathname.match(/^\/app\/matches\/[^/]+$/)) return "Détail du match";
  if (pathname.match(/^\/app\/events\/[^/]+$/)) return "Détail de l'événement";
  if (pathname.match(/^\/app\/organization\/[^/]+$/)) return "Mon Club";

  return "AceClub";
}

export function UserHeader() {
  const pathname = usePathname();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <h1 className="flex-1 text-sm font-medium">{title}</h1>
      <a href="/app/notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </a>
    </header>
  );
}

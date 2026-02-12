"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Swords,
  Compass,
  Calendar,
  User,
  Trophy,
  BarChart3,
  Bell,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMe } from "@/hooks/use-user-queries";
import { usePreferences } from "@/hooks/use-user-queries";
import { useUnreadCount } from "@/hooks/use-notification-queries";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { title: "Accueil", url: "/app", icon: Home },
  { title: "Matchs", url: "/app/matches", icon: Swords },
  { title: "Découvrir", url: "/app/discover", icon: Compass },
  { title: "Événements", url: "/app/events", icon: Calendar },
  { title: "Profil", url: "/app/profile", icon: User },
  { title: "Progression", url: "/app/progression", icon: Trophy },
  { title: "Classement", url: "/app/leaderboard", icon: BarChart3 },
];

export function AppUserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me } = useMe();
  const { data: prefs } = usePreferences();
  const { data: unreadData } = useUnreadCount();

  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const isActive = (url: string) => {
    if (url === "/app") return pathname === "/app";
    return pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/app">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-bold">
                  A
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AceClub</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {prefs?.sport === "padel" ? "Padel" : "Tennis"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app/notifications")}>
                  <a href="/app/notifications">
                    <Bell className="size-4" />
                    <span>Notifications</span>
                  </a>
                </SidebarMenuButton>
                {unreadCount > 0 && <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>}
              </SidebarMenuItem>
              {prefs?.organizationId && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/app/organization")}>
                    <a href={`/app/organization/${prefs.organizationId}`}>
                      <Building2 className="size-4" />
                      <span>Mon Club</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app/settings")}>
                  <a href="/app/settings">
                    <Settings className="size-4" />
                    <span>Paramètres</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/app/profile" className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={me?.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {me?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{me?.name ?? "Utilisateur"}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="size-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

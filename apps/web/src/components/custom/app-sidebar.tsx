"use client"

import * as React from "react"
import {
  Award,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Swords,
  Target,
  ToggleRight,
  Users,
  Shield,
  UserX,
} from "lucide-react"

import { NavMain } from "@/components/custom/nav-main"
import { NavUser } from "@/components/custom/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Utilisateurs",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Organisations",
    url: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Matchs",
    url: "/dashboard/matches",
    icon: Swords,
  },
  {
    title: "\u00c9v\u00e9nements",
    url: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    title: "Feature Flags",
    url: "/dashboard/feature-flags",
    icon: ToggleRight,
  },
  {
    title: "Suppressions",
    url: "/dashboard/deletion-requests",
    icon: UserX,
  },
  {
    title: "Configuration",
    url: "/dashboard/game-config",
    icon: Settings,
  },
  {
    title: "D\u00e9fis",
    url: "/dashboard/challenges",
    icon: Target,
  },
  {
    title: "Badges",
    url: "/dashboard/badges",
    icon: Award,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }
    : {
        name: "Admin",
        email: "",
        avatar: "",
      }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-display text-lg uppercase tracking-tight">Ace Club</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

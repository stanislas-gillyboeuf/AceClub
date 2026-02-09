"use client"

import * as React from "react"
import {
  Building2,
  LayoutDashboard,
  LifeBuoy,
  Users,
  Shield,
  ToggleRight,
} from "lucide-react"

import { NavMain } from "@/components/custom/nav-main"
import { NavSecondary } from "@/components/custom/nav-secondary"
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
    title: "Feature Flags",
    url: "/dashboard/feature-flags",
    icon: ToggleRight,
  },
]

const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AceClub</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

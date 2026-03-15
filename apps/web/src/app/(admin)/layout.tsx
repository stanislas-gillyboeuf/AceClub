"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/custom/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { Providers } from "@/app/providers"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== "admin")) {
      router.replace("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    return null
  }

  return (
    <Providers>
      <SidebarProvider open={false} onOpenChange={() => {}}>
        <AppSidebar />
        <SidebarInset className="flex h-screen flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  )
}

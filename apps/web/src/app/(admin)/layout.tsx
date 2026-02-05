"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/custom/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
    if (!isPending && !session) {
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

  if (!session) {
    return null
  }

  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-screen flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  )
}

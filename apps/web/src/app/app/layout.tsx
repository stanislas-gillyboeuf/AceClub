"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppUserSidebar } from "@/components/custom/app-user-sidebar";
import { UserHeader } from "@/components/custom/user-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { Providers } from "@/app/providers";
import { useMe } from "@/hooks/use-user-queries";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: me, isPending: mePending } = useMe();

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/login");
    }
  }, [session, sessionPending, router]);

  // Redirect to onboarding if not completed (except if already on onboarding)
  useEffect(() => {
    if (!mePending && me && !me.onboardingCompleted && pathname !== "/app/onboarding") {
      router.replace("/app/onboarding");
    }
  }, [me, mePending, pathname, router]);

  if (sessionPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppUserSidebar />
      <SidebarInset className="flex h-screen flex-col">
        <UserHeader />
        <main className="flex flex-1 flex-col overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppLayoutInner>{children}</AppLayoutInner>
    </Providers>
  );
}

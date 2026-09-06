"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { siteConfig } from "@/lib/config";
import { MotionDiv } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const { menuItems, legalItems } = siteConfig.navigation;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrolled = useScroll(8);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled]);

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.25, ease: "easeInOut" } },
    open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <Suspense fallback={null}>
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled ? "border-b border-mkt-border bg-mkt-bg/85 backdrop-blur-md" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-[var(--max-container-width)] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" title="Ace Club">
            <Icons.logo className="h-7 w-7 rounded-[7px]" />
            <span className="text-[15px] font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {menuItems
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[14px] font-medium transition-colors",
                    pathname === item.href ? "text-mkt-fg" : "text-mkt-fg-dim hover:text-mkt-fg"
                  )}
                >
                  {item.title}
                </Link>
              ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/tarifs#demo"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-mkt-accent px-5 text-mkt-accent-foreground hover:bg-mkt-accent/90"
              )}
            >
              {siteConfig.cta}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="block lg:hidden p-2 -mr-2"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <MenuToggleIcon open={mobileMenuOpen} className="h-6 w-6" />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <MotionDiv
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="lg:hidden overflow-hidden border-t border-mkt-border bg-mkt-bg"
            >
              <nav className="mx-auto max-w-[var(--max-container-width)] px-6 py-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 rounded-lg text-[15px] font-medium"
                  >
                    {item.title}
                    <ChevronRight className="h-4 w-4 text-mkt-fg-dim" />
                  </Link>
                ))}
                <div className="my-2 border-t border-mkt-border" />
                {legalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 rounded-lg text-[14px] text-mkt-fg-dim"
                  >
                    {item.title}
                    <ChevronRight className="h-4 w-4 text-mkt-fg-dim" />
                  </Link>
                ))}
                <div className="pt-3 pb-1">
                  <Link
                    href="/tarifs#demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-full bg-mkt-accent text-mkt-accent-foreground hover:bg-mkt-accent/90"
                    )}
                  >
                    {siteConfig.cta}
                  </Link>
                </div>
              </nav>
            </MotionDiv>
          )}
        </AnimatePresence>
      </header>
    </Suspense>
  );
}

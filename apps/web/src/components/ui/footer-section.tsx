"use client"

import Link from "next/link"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/lib/config"

const currentYear = new Date().getFullYear()

function Footerdemo() {
  return (
    <footer className="border-t border-mkt-border bg-mkt-bg text-mkt-fg">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <Icons.logo className="h-7 w-7 rounded-[7px]" />
            <span className="text-[15px] font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px]">
            {siteConfig.navigation.menuItems
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-mkt-fg-dim transition-colors hover:text-mkt-fg"
                >
                  {item.title}
                </Link>
              ))}
            {siteConfig.navigation.legalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-mkt-fg-dim transition-colors hover:text-mkt-fg"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-mkt-border pt-6 text-[13px] text-mkt-fg-dim sm:flex-row">
          <p>© {currentYear} {siteConfig.name}. Tous droits réservés.</p>
          <a href={`mailto:${siteConfig.links.email}`} className="hover:text-mkt-fg">
            {siteConfig.links.email}
          </a>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }

"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";

const currentYear = new Date().getFullYear();

function Footerdemo() {
  return (
    <footer className="relative border-t bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Icons.logo className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold">{siteConfig.name}</span>
            </Link>
            <p className="max-w-md text-muted-foreground">{siteConfig.description}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Navigation</h3>
            <nav className="space-y-2 text-sm">
              {siteConfig.navigation.menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {siteConfig.name}. Tous droits réservés.
          </p>
          <nav className="flex gap-4 text-sm">
            {siteConfig.navigation.legalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };

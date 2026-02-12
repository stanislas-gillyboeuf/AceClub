"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronRight,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  MailIcon,
  MessageSquareIcon,
  ShieldIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";

const menuItems = [
  {
    title: "Accueil",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Fonctionnalités",
    href: "#features",
    icon: UsersIcon,
  },
  {
    title: "Tarifs",
    href: "#pricing",
    icon: StarIcon,
  },
  {
    title: "FAQ",
    href: "#faq",
    icon: HelpCircleIcon,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: MailIcon,
  },
];

const legalItems = [
  {
    title: "CGU",
    href: "/cgu",
    icon: FileTextIcon,
  },
  {
    title: "Confidentialité",
    href: "/privacy",
    icon: ShieldIcon,
  },
];

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <div>
            <Link href="/" title="brand-logo" className="relative mr-6 flex items-center space-x-2">
              <Icons.logo className="h-10 w-10 rounded-lg" />
              <span className="font-bold text-xl">{siteConfig.name}</span>
            </Link>
          </div>
        </DrawerHeader>

        <div className="px-6 py-4">
          {/* Menu principal */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <DrawerClose key={item.title} asChild>
                <Link
                  href={item.href}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </DrawerClose>
            ))}
          </nav>

          {/* Séparateur */}
          <div className="my-4 border-t" />

          {/* Liens légaux */}
          <nav className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Légal
            </p>
            {legalItems.map((item) => (
              <DrawerClose key={item.title} asChild>
                <Link
                  href={item.href}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{item.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </DrawerClose>
            ))}
          </nav>
        </div>

        <DrawerFooter className="px-6">
          <DrawerClose asChild>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "text-white rounded-full group w-full",
              )}
            >
              {siteConfig.cta}
            </Link>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv, MotionHeader, MotionHr } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, useAnimation } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";

const { features, resources, menuItems, legalItems } = siteConfig.navigation;

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [addBorder, setAddBorder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const controls = useAnimation();
  const scrolled = useScroll(20);

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY);
      setAddBorder(currentScrollY > 20);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    setIsInitialLoad(false);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    controls.start(isVisible ? "visible" : "hidden");
  }, [isVisible, controls]);

  // Close mobile menu when scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [scrolled]);

  const headerVariants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: easeInOutCubic,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: easeInOutCubic,
      },
    },
  };

  return (
    <Suspense fallback={null}>
      <AnimatePresence>
        {isVisible && (
          <MotionHeader
            initial="hidden"
            animate={controls}
            exit="hidden"
            variants={headerVariants}
            transition={{
              duration: isInitialLoad ? 1 : 0.3,
              delay: isInitialLoad ? 0.5 : 0,
              ease: easeInOutCubic,
            }}
            className={cn("sticky top-0 z-50 p-0 bg-background/60 backdrop-blur")}
          >
            <div className="flex justify-between items-center container mx-auto p-2">
              {/* Logo */}
              <Link
                href="/"
                title="brand-logo"
                className="relative mr-6 flex items-center space-x-2"
              >
                <Icons.logo className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-xl">{siteConfig.name}</span>
              </Link>

              {/* Navigation Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <NavigationMenu>
                  <NavigationMenuList>
                    {/* Fonctionnalités */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Fonctionnalités</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {features.map((feature) => (
                            <ListItem
                              key={feature.title}
                              title={feature.title}
                              href={feature.href}
                              icon={feature.icon}
                            >
                              {feature.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* À propos */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>À propos</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[250px] gap-3 p-4">
                          {resources.map((resource) => (
                            <ListItem
                              key={resource.title}
                              href={resource.href}
                              title={resource.title}
                            >
                              {resource.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Légal */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Légal</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          <ListItem href="/cgu" title="CGU">
                            Conditions générales d'utilisation
                          </ListItem>
                          <ListItem href="/privacy" title="Confidentialité">
                            Politique de protection des données
                          </ListItem>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                {/* CTA Button */}
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-9 text-white group ml-4",
                  )}
                >
                  {siteConfig.cta}
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="block lg:hidden p-2 -mr-2"
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <MenuToggleIcon open={mobileMenuOpen} className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <MotionDiv
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={mobileMenuVariants}
                  className="lg:hidden overflow-hidden border-t"
                >
                  <nav className="container mx-auto px-4 py-4 space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <span className="font-medium">{item.title}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}

                    {/* Separator */}
                    <div className="my-3 border-t" />

                    {/* Legal links */}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      Légal
                    </p>
                    {legalItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <span className="text-muted-foreground">{item.title}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          buttonVariants({ variant: "default", size: "lg" }),
                          "text-white rounded-full w-full",
                        )}
                      >
                        {siteConfig.cta}
                      </Link>
                    </div>
                  </nav>
                </MotionDiv>
              )}
            </AnimatePresence>

            <MotionHr
              initial={{ opacity: 0 }}
              animate={{ opacity: addBorder ? 1 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute w-full bottom-0"
            />
          </MotionHeader>
        )}
      </AnimatePresence>
    </Suspense>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ComponentType<{ className?: string }> }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

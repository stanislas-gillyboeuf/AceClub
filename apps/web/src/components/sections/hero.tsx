"use client";

import { CourtLines } from "@/components/graphics/court-lines";
import { buttonVariants } from "@/components/ui/button";
import { DeviceMockup } from "@/components/ui/device-mockup";
import { easeOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv, MotionP } from "@/lib/motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-24 sm:pt-32">
      <CourtLines className="absolute inset-x-0 top-0 -z-10 h-full w-full text-mkt-fg/[0.04]" />

      <div className="mx-auto max-w-[var(--max-container-width)] px-6 text-center">
        <MotionP
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutCubic }}
          className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent"
        >
          Pour les dirigeants de clubs de tennis et padel
        </MotionP>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: easeOutCubic }}
          className="mx-auto mt-2 max-w-4xl text-balance font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl"
        >
          Remplissez vos courts. Simplifiez votre club.
        </MotionDiv>

        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOutCubic }}
          className="mx-auto mt-8 max-w-xl text-balance text-lg text-mkt-fg-dim sm:text-xl"
        >
          L&apos;appli qui fait jouer vos adhérents, et le dashboard qui vous
          fait gagner du temps chaque semaine.
        </MotionP>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOutCubic }}
          className="mt-9 flex items-center justify-center"
        >
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mkt-gradient h-12 rounded-full px-8 text-[15px] font-semibold hover:opacity-90"
            )}
          >
            {siteConfig.cta}
          </Link>
        </MotionDiv>
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: easeOutCubic }}
        className="mt-16 sm:mt-20"
      >
        <DeviceMockup
          tabletAlt="Le dashboard club dans Ace Club"
          phoneAlt="L'application Ace Club"
        />
      </MotionDiv>
    </section>
  );
}

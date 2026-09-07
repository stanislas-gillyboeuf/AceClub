"use client";

import { CourtLines } from "@/components/graphics/court-lines";
import { buttonVariants } from "@/components/ui/button";
import { easeOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv, MotionP } from "@/lib/motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-24 sm:pt-32">
      <CourtLines className="absolute inset-x-0 top-0 -z-10 h-full w-full text-mkt-fg/[0.05]" />

      <div className="mx-auto max-w-[var(--max-container-width)] px-6 text-center">
        <MotionP
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutCubic }}
          className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent"
        >
          Un club vivant, c&apos;est
        </MotionP>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: easeOutCubic }}
          className="mx-auto mt-2 max-w-4xl text-balance font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl"
        >
          des joueurs qui jouent.
        </MotionDiv>

        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: easeOutCubic }}
          className="mx-auto mt-8 max-w-xl text-balance text-lg text-mkt-fg-dim sm:text-xl"
        >
          Ace Club est l&apos;appli qui répond à tous les besoins de vos
          adhérents : réservation, recherche de partenaire, inscription aux
          événements et suivi de leur activité.
        </MotionP>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOutCubic }}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/tarifs#demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full bg-mkt-accent px-7 text-[15px] font-semibold text-mkt-accent-foreground hover:bg-mkt-accent/90"
            )}
          >
            {siteConfig.cta}
          </Link>
          <Link
            href={siteConfig.appLinks.ios}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-medium text-mkt-fg-dim underline underline-offset-4 hover:text-mkt-fg"
          >
            Voir l&apos;app sur l&apos;App Store
          </Link>
        </MotionDiv>
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: easeOutCubic }}
        className="relative mx-auto mt-16 flex max-w-3xl justify-center gap-5 px-6 sm:mt-20"
      >
        {/* Placeholder screenshots — replace with real captures (Discover + Réservation) */}
        <div className="w-40 -rotate-3 overflow-hidden rounded-[24px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:w-52">
          <img src="/Device-3.png" alt="Aperçu Ace Club" className="aspect-[9/18] w-full object-cover object-top" />
        </div>
        <div className="mt-8 w-40 rotate-2 overflow-hidden rounded-[24px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:w-52">
          <img src="/Device-2.png" alt="Aperçu Ace Club" className="aspect-[9/18] w-full object-cover object-top" />
        </div>
      </MotionDiv>
    </section>
  );
}

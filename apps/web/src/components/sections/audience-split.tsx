"use client";

import { Check } from "lucide-react";
import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ImageSlot } from "@/components/ui/image-slot";

const ADHERENT_POINTS = [
  "Suivre l'actu de son club",
  "S'inscrire aux événements",
  "Trouver des partenaires de jeu",
  "Réserver un terrain en 3 clics",
];

const CLUB_POINTS = [
  "Synchronisation ADOC en 5 minutes",
  "Gérer les courts et les règles de réservation",
  "Centraliser la communication avec les adhérents",
];

export function AudienceSplit() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: easeOutCubic }}
            className="rounded-[32px] border border-mkt-border bg-mkt-bg-raised p-8 shadow-[0_20px_50px_-25px_rgba(10,40,20,0.15)] sm:p-10"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
              Côté adhérents
            </span>
            <h2 className="mt-2 text-balance font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
              L&apos;appli
            </h2>
            <ul className="mt-6 space-y-3">
              {ADHERENT_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[15px] text-mkt-fg/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mkt-accent" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <ImageSlot
                ratio="phone"
                alt="L'application Ace Club côté adhérent"
                className="max-w-[200px] rounded-[24px]"
              />
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutCubic }}
            className="rounded-[32px] border border-mkt-border bg-mkt-bg-raised p-8 shadow-[0_20px_50px_-25px_rgba(10,40,20,0.15)] sm:p-10"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
              Côté club
            </span>
            <h2 className="mt-2 text-balance font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
              Le dashboard
            </h2>
            <ul className="mt-6 space-y-3">
              {CLUB_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[15px] text-mkt-fg/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-mkt-accent" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <ImageSlot
                ratio="tablet"
                alt="Le dashboard club Ace Club"
                className="max-w-[320px] rounded-[24px]"
              />
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}

"use client";

import {
  CalendarCheck,
  CalendarDays,
  Megaphone,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ImageSlot } from "@/components/ui/image-slot";

const CARDS = [
  {
    icon: RefreshCw,
    title: "Synchronisation ADOC",
    description: "Importez vos adhérents en 5 minutes, sans ressaisie.",
  },
  {
    icon: SlidersHorizontal,
    title: "Courts et règles",
    description: "Configurez vos courts, vos créneaux et vos règles de réservation.",
  },
  {
    icon: CalendarCheck,
    title: "Réservations",
    description: "Suivez en temps réel qui joue, où et quand.",
  },
  {
    icon: Users,
    title: "Membres",
    description: "Retrouvez vos adhérents et repérez les plus actifs.",
  },
  {
    icon: CalendarDays,
    title: "Événements et cours",
    description: "Créez un événement, ouvrez les inscriptions, suivez les inscrits.",
  },
  {
    icon: Megaphone,
    title: "Communication",
    description: "Envoyez actus et notifications à tous vos adhérents depuis un seul endroit.",
  },
];

export function ClubDashboard() {
  return (
    <section className="mkt-gradient py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em]">
            Le tableau de bord du club
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Pilotez votre club depuis un seul tableau de bord.
          </h2>
          <p className="mt-5 text-balance text-lg opacity-90">
            Courts, membres, événements, communication : tout est centralisé
            et synchronisé avec ADOC en 5 minutes.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, index) => (
            <MotionDiv
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: easeOutCubic }}
              className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <card.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold leading-snug">{card.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed opacity-85">{card.description}</p>
            </MotionDiv>
          ))}
        </div>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: easeOutCubic }}
          className="mx-auto mt-14 max-w-lg"
        >
          <ImageSlot
            ratio="tablet"
            alt="Le dashboard club avec le taux d'occupation des courts sur 7 jours"
            className="rounded-[24px]"
          />
        </MotionDiv>
      </div>
    </section>
  );
}

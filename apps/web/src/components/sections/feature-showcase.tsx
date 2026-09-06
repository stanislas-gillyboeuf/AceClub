"use client";

import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  align: "left" | "right";
}

const FEATURES: Feature[] = [
  {
    id: "partenaire",
    eyebrow: "Trouver un partenaire",
    title: "Un partenaire de jeu, jamais loin",
    description:
      "Vos membres publient une recherche de match ou d'entraînement, tennis ou padel, et se retrouvent directement dans l'app. Plus personne ne reste sur le carreau faute de partenaire.",
    points: [
      "Recherche par niveau et disponibilité",
      "Messagerie intégrée pour s'organiser",
      "Fini les groupes WhatsApp surchargés",
    ],
    image: "/Device-4.png",
    align: "left",
  },
  {
    id: "reservation",
    eyebrow: "Réservation de terrain",
    title: "La réservation, enfin sans friction",
    description:
      "Disponibilités en temps réel, réservation en quelques secondes — seul, entre amis, ou pour compléter une équipe de padel. Fini les carnets papier et les créneaux qui se chevauchent.",
    points: [
      "Disponibilités tennis et padel en temps réel",
      "Réservation à plusieurs en un tap",
      "Règles du club appliquées automatiquement",
    ],
    image: "/Device-2.png",
    align: "right",
  },
  {
    id: "carnet",
    eyebrow: "Carnet de bord",
    title: "Chaque match compte, et se souvient",
    description:
      "Scores, adversaires, ressenti après le match : chaque partie s'enregistre en quelques secondes et vient nourrir un historique complet de la vie du joueur au club.",
    points: [
      "Scores enregistrés set par set",
      "Historique complet des matchs joués",
      "Base du niveau et du classement",
    ],
    image: "/Device-5.png",
    align: "left",
  },
];

function FeatureRow({ feature }: { feature: Feature }) {
  const isRight = feature.align === "right";
  return (
    <div
      id={feature.id}
      className={cn(
        "flex scroll-mt-24 flex-col items-center gap-12 py-20 sm:py-28 lg:flex-row lg:gap-20",
        isRight && "lg:flex-row-reverse"
      )}
    >
      <MotionDiv
        initial={{ opacity: 0, x: isRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: easeOutCubic }}
        className="w-full max-w-md lg:w-1/2"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          {feature.eyebrow}
        </span>
        <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
          {feature.title}
        </h2>
        <p className="mt-4 text-balance text-lg leading-relaxed text-mkt-fg-dim">
          {feature.description}
        </p>
        <ul className="mt-6 space-y-3">
          {feature.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-[15px] text-mkt-fg/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mkt-accent" strokeWidth={2.5} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </MotionDiv>

      <MotionDiv
        initial={{ opacity: 0, x: isRight ? -40 : 40, scale: 0.96 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: easeOutCubic }}
        className="w-full max-w-sm lg:w-1/2"
      >
        {/* Placeholder screenshot — swap for the real app capture for this feature */}
        <div className="overflow-hidden rounded-[28px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
          <img
            src={feature.image}
            alt={feature.title}
            className="aspect-[9/16] w-full object-cover object-top"
          />
        </div>
      </MotionDiv>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section className="mx-auto max-w-[var(--max-container-width)] divide-y divide-mkt-border px-6">
      {FEATURES.map((feature) => (
        <FeatureRow key={feature.id} feature={feature} />
      ))}
    </section>
  );
}

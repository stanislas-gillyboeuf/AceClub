"use client";

import { Calendar, MessagesSquare, Newspaper, Trophy, UserSearch } from "lucide-react";
import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ImageSlot } from "@/components/ui/image-slot";

const CARDS = [
  {
    icon: Newspaper,
    title: "Suivre et contribuer au fil d'actus du club",
  },
  {
    icon: Calendar,
    title: "S'inscrire aux événements du club",
  },
  {
    icon: UserSearch,
    title: "Trouver des partenaires de son niveau",
  },
  {
    icon: Trophy,
    title: "Réserver un court en 3 clics",
  },
];

const EXTRA = "Messagerie entre membres, défis, récompenses et classement du club.";

export function AdherentFeatures() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Côté adhérents
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            L&apos;appli
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
          {CARDS.map((card, index) => (
            <MotionDiv
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutCubic }}
              className="flex items-center gap-4 rounded-[28px] border border-mkt-border bg-mkt-bg-raised p-6 shadow-[0_20px_50px_-25px_rgba(10,40,20,0.15)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mkt-fg/5 text-mkt-fg">
                <card.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-[15px] font-semibold leading-snug">{card.title}</h3>
            </MotionDiv>
          ))}
        </div>

        <div className="mx-auto mt-6 flex max-w-3xl items-start gap-2.5 px-2 text-[14px] text-mkt-fg-dim">
          <MessagesSquare className="mt-0.5 h-4 w-4 shrink-0 text-mkt-accent" strokeWidth={2} />
          <span>{EXTRA}</span>
        </div>

        <div className="mt-12 flex justify-center">
          <ImageSlot
            ratio="phone"
            alt="Le fil d'actus de l'application Ace Club"
            className="max-w-[220px] rounded-[24px]"
          />
        </div>
      </div>
    </section>
  );
}

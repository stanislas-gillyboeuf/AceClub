"use client";

import {
  Award,
  Bell,
  Calendar,
  MessagesSquare,
  Newspaper,
  Trophy,
  UserSearch,
} from "lucide-react";
import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ImageSlot } from "@/components/ui/image-slot";

const ITEMS = [
  { icon: Calendar, label: "Réservation de courts en 3 clics" },
  { icon: UserSearch, label: "Recherche de partenaires par niveau" },
  { icon: Trophy, label: "Inscription aux événements et tournois" },
  { icon: Newspaper, label: "Fil d'actus du club" },
  { icon: MessagesSquare, label: "Messagerie entre membres" },
  { icon: Award, label: "Défis, récompenses et classement du club" },
  { icon: Bell, label: "Notifications push personnalisées" },
];

export function AdherentFeatures() {
  return (
    <section id="fonctionnalites" className="scroll-mt-24 border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            L&apos;application de vos adhérents
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Tout ce que vos adhérents font au club, dans une seule application.
          </h2>
          <p className="mt-5 text-balance text-lg text-mkt-fg-dim">
            Réserver, trouver un partenaire, s&apos;inscrire aux événements,
            suivre la vie du club. Fini les messages perdus et les groupes
            WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ul className="mx-auto w-full max-w-md space-y-4">
            {ITEMS.map((item, index) => (
              <MotionDiv
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: easeOutCubic }}
                className="flex items-center gap-4 rounded-[28px] border border-mkt-border bg-mkt-bg-raised px-5 py-4 shadow-[0_20px_50px_-25px_rgba(10,40,20,0.15)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mkt-fg/5 text-mkt-fg">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="text-[15px] font-semibold leading-snug">{item.label}</span>
              </MotionDiv>
            ))}
          </ul>

          <MotionDiv
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, ease: easeOutCubic }}
            className="mx-auto w-full max-w-xs"
          >
            <ImageSlot
              ratio="phone"
              alt="Le fil d'actus de l'application Ace Club"
              className="rounded-[28px]"
            />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}

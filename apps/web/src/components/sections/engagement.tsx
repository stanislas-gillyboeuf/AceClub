"use client";

import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { Award, Flame, Target, TrendingUp } from "lucide-react";

const ITEMS = [
  {
    icon: TrendingUp,
    title: "Niveau",
    description: "Évolue avec chaque match joué.",
  },
  {
    icon: Award,
    title: "Classement",
    description: "La régularité compte plus que la performance brute.",
  },
  {
    icon: Target,
    title: "Défis",
    description: "Des objectifs réguliers pour garder le rythme.",
  },
  {
    icon: Flame,
    title: "Badges",
    description: "Chaque étape franchie au club est valorisée.",
  },
];

export function Engagement() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Classement & défis
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Ça donne envie de revenir
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
          {ITEMS.map((item, index) => (
            <MotionDiv
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutCubic }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-mkt-accent/30 text-mkt-accent">
                <item.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold">{item.title}</h3>
              <p className="mt-1 text-[14px] text-mkt-fg-dim">{item.description}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

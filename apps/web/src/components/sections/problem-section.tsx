"use client";

import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { MessageCircleOff, UserSearch, Wrench } from "lucide-react";

const PROBLEMS = [
  {
    icon: MessageCircleOff,
    title: "Les messages se perdent",
    description:
      "La communication entre le club et ses adhérents passe par cent canaux, et personne ne voit rien.",
  },
  {
    icon: UserSearch,
    title: "Trouver un partenaire est une corvée",
    description:
      "Trouver quelqu'un de son niveau devrait être un réflexe, pas un parcours du combattant.",
  },
  {
    icon: Wrench,
    title: "Les outils gèrent, ils ne donnent pas envie de jouer",
    description:
      "Le numérique des clubs est pensé pour administrer, pas pour faire jouer.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Un club vivant, c&apos;est un club où jouer redevient simple.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
          {PROBLEMS.map((item, index) => (
            <MotionDiv
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutCubic }}
              className="rounded-[28px] border border-mkt-border bg-mkt-bg-raised p-7 shadow-[0_20px_50px_-25px_rgba(10,40,20,0.15)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mkt-fg/5 text-mkt-fg">
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-mkt-fg-dim">
                {item.description}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

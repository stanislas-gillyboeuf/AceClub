"use client";

import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { TodoNote } from "@/components/ui/todo-note";
import type { ReactNode } from "react";

interface Step {
  title: string;
  body: ReactNode;
}

const STEPS: Step[] = [
  {
    title: "On se parle 20 minutes",
    body: "On regarde votre club, vos courts, vos règles.",
  },
  {
    title: "On synchronise avec ADOC en 5 minutes",
    body: "Vos données sont reprises, rien à ressaisir.",
  },
  {
    title: "Vos adhérents téléchargent l'app",
    body: (
      <>
        Votre club s&apos;anime dès la première semaine.{" "}
        <TodoNote>confirmer ce délai</TodoNote>
      </>
    ),
  },
];

export function OnboardingSteps() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-24 border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            De la prise de contact au premier match
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-x-8 gap-y-12 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <MotionDiv
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutCubic }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mkt-fg font-display text-lg text-mkt-bg">
                {index + 1}
              </span>
              <h3 className="mt-4 text-[17px] font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-mkt-fg-dim">{step.body}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

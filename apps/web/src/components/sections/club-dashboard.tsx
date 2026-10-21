"use client";

import { Check } from "lucide-react";
import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ImageSlot } from "@/components/ui/image-slot";

const POINTS = [
  "Synchroniser avec ADOC en 5 minutes",
  "Gérer vos courts et vos règles",
  "Centraliser la communication",
  "Suivre le taux d'occupation des courts, les membres les plus actifs et les cours du jour",
];

export function ClubDashboard() {
  return (
    <section className="mkt-gradient py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: easeOutCubic }}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em]">
              Côté club
            </span>
            <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
              Le dashboard
            </h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[16px] font-medium leading-snug">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutCubic }}
            className="flex justify-center"
          >
            <ImageSlot
              ratio="tablet"
              alt="Le dashboard club avec le taux d'occupation des courts mis en avant"
              className="max-w-[360px] rounded-[24px]"
            />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}

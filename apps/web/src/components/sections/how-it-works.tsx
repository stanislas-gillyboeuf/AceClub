"use client";

import { easeOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv } from "@/lib/motion";

export function HowItWorks() {
  return (
    <section className="border-t border-mkt-border bg-mkt-bg-raised py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Mise en place
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            De la prise de contact au premier match
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-x-8 gap-y-12 sm:grid-cols-2">
          {siteConfig.onboardingSteps.map((step, index) => (
            <MotionDiv
              key={step.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: easeOutCubic }}
              className="flex gap-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mkt-accent font-display text-lg text-mkt-accent-foreground">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{step.name}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-mkt-fg-dim">
                  {step.description}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

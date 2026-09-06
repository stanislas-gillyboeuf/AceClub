"use client";

import { easeOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Tarifs
          </span>
          <h1 className="mt-3 text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
            Un tarif simple, basé sur votre club
          </h1>
          <p className="mt-5 text-balance text-lg text-mkt-light-fg-dim">
            Gratuit pour tous vos adhérents. Le club règle un abonnement selon
            sa taille — sans engagement de durée.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {siteConfig.pricing.map((plan, index) => (
            <MotionDiv
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutCubic }}
              className={cn(
                "flex flex-col rounded-3xl border p-8",
                plan.isPopular
                  ? "border-mkt-light-fg shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]"
                  : "border-mkt-light-border"
              )}
            >
              {plan.isPopular && (
                <span className="mb-4 w-fit rounded-full bg-mkt-light-fg px-3 py-1 text-xs font-semibold text-mkt-light-bg">
                  Le plus choisi
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-[14px] text-mkt-light-fg-dim">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-[15px] text-mkt-light-fg-dim">/{plan.period}</span>}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[14px] text-mkt-light-fg/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mkt-light-fg" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  "mt-8 flex h-11 items-center justify-center rounded-full text-[14px] font-medium transition-colors",
                  plan.isPopular
                    ? "bg-mkt-light-fg text-mkt-light-bg hover:bg-mkt-light-fg/85"
                    : "bg-black/5 text-mkt-light-fg hover:bg-black/10"
                )}
              >
                {plan.buttonText}
              </Link>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

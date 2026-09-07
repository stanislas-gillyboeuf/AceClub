"use client";

import { easeOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ITEMS = [
  { label: "Trouver un partenaire", image: "/Device-4.png" },
  { label: "Réserver un terrain", image: "/Device-2.png" },
  { label: "Classement du club", image: "/Device-5.png" },
];

export function ProductTeaser() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Un aperçu de l&apos;app
          </h2>
          <p className="mt-4 text-balance text-lg text-mkt-fg-dim">
            Ce que vos adhérents ouvrent tous les jours.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4 sm:gap-8">
          {ITEMS.map((item, index) => (
            <MotionDiv
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutCubic }}
              className="flex flex-col items-center"
            >
              {/* Placeholder screenshot — swap for the real app capture */}
              <div className="w-full overflow-hidden rounded-2xl border border-mkt-border bg-mkt-bg-raised">
                <img src={item.image} alt={item.label} className="aspect-[9/18] w-full object-cover object-top" />
              </div>
              <p className="mt-4 text-center text-[13px] font-medium text-mkt-fg-dim sm:text-[14px]">
                {item.label}
              </p>
            </MotionDiv>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/produit"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-mkt-accent hover:opacity-80"
          >
            Voir toutes les fonctionnalités
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

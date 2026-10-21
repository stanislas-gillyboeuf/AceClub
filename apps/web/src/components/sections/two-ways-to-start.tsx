import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const PATHS = [
  {
    title: "Je garde mon logiciel actuel",
    badge: null,
    points: [
      "Synchronisation avec ADOC en 5 minutes",
      "Vos adhérents gardent leurs habitudes",
      "Vous ajoutez l'app, les événements, les partenaires, le classement",
    ],
  },
  {
    title: "Ace Club comme outil principal",
    badge: "Recommandé",
    points: [
      "App adhérents + tableau de bord",
      "Réservations, membres, cours, événements et communication au même endroit",
      "Paiements et cotisations : vous gardez votre solution actuelle",
    ],
  },
];

export function TwoWaysToStart() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Branchez Ace Club à votre logiciel, ou faites-en votre outil
            principal.
          </h2>
          <p className="mt-5 text-balance text-lg text-mkt-fg-dim">
            Dans les deux cas, la mise en place n&apos;interrompt pas votre
            club.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {PATHS.map((path) => (
            <div
              key={path.title}
              className={cn(
                "flex flex-col rounded-[28px] border p-8",
                path.badge
                  ? "border-mkt-fg shadow-[0_20px_60px_-25px_rgba(10,40,20,0.25)]"
                  : "border-mkt-border"
              )}
            >
              {path.badge && (
                <span className="mb-4 w-fit rounded-full bg-mkt-fg px-3 py-1 text-xs font-semibold text-mkt-bg">
                  {path.badge}
                </span>
              )}
              <h3 className="text-lg font-semibold">{path.title}</h3>
              <ul className="mt-5 flex-1 space-y-3">
                {path.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-mkt-fg/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mkt-accent" strokeWidth={2.5} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mkt-gradient h-12 rounded-full px-8 text-[15px] font-semibold hover:opacity-90"
            )}
          >
            {siteConfig.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

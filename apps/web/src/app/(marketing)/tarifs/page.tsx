import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LaunchOffer } from "@/components/sections/launch-offer";
import { cn, constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Tarifs",
  description:
    "3 mois offerts pour démarrer, puis un tarif adapté à la taille de votre club, déterminé pendant la démo.",
});

export default function TarifsPage() {
  return (
    <div className="mkt-light-section">
      <div className="mx-auto max-w-2xl px-6 pb-4 pt-20 text-center sm:pt-28">
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          Tarifs
        </span>
        <h1 className="mx-auto mt-3 text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Un tarif déterminé avec vous, pas une grille figée.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-mkt-light-fg-dim">
          Le tarif dépend de la taille de votre club — on le détermine
          ensemble pendant la démo.
        </p>
      </div>

      <LaunchOffer />

      <section className="border-t border-mkt-light-border py-20 sm:py-28">
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center">
          <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Réservez votre démo
          </h2>
          <p className="mt-4 text-balance text-lg text-mkt-light-fg-dim">
            30 minutes en visio avec Stanislas, le fondateur. On parle de
            votre club et on détermine le tarif ensemble.
          </p>
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mkt-gradient mt-8 h-12 rounded-full px-8 text-[15px] font-semibold hover:opacity-90"
            )}
          >
            Réserver une démo
          </Link>
        </div>
      </section>
    </div>
  );
}

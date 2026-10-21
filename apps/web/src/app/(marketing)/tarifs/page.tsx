import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LaunchOffer } from "@/components/sections/launch-offer";
import { Pricing } from "@/components/sections/pricing";
import { TodoNote } from "@/components/ui/todo-note";
import { cn, constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Tarifs",
  description:
    "Un tarif simple basé sur la taille de votre club. Gratuit pour tous vos adhérents, 3 mois offerts pour démarrer.",
});

export default function TarifsPage() {
  return (
    <div className="mkt-light-section">
      <LaunchOffer />
      <Pricing />

      <section className="border-t border-mkt-light-border py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-balance font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
            Ce qui est inclus
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-mkt-light-fg-dim">
            Chaque formule donne accès à l&apos;ensemble des fonctionnalités
            d&apos;Ace Club, côté adhérents comme côté club.{" "}
            <TodoNote>
              détail précis des fonctionnalités par formule, si des
              différences existent
            </TodoNote>
          </p>
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 border-t border-mkt-light-border py-20 sm:py-28">
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center">
          <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Réservez votre démo
          </h2>
          <p className="mt-4 text-balance text-lg text-mkt-light-fg-dim">
            30 minutes en visio avec Stanislas, le fondateur. On parle de
            votre club, on regarde l&apos;app ensemble.
          </p>
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mkt-gradient mt-8 h-12 rounded-full px-8 text-[15px] font-semibold hover:opacity-90"
            )}
          >
            Réserver une démo de 20 min
          </Link>
        </div>
      </section>
    </div>
  );
}

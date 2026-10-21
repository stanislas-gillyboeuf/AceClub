import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    title: "Un seul interlocuteur",
    description: "Le fondateur, du premier échange à la mise en place.",
  },
  {
    title: "Une mise en place accompagnée",
    description: "Sans interrompre votre club.",
  },
  {
    title: "Vos données",
    description: "Appartiennent à votre club.",
  },
];

export function FounderStory() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Qui est derrière Ace Club
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Créé par quelqu&apos;un qui connaît les clubs de l&apos;intérieur.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <ImageSlot
            ratio="square"
            alt="Stanislas, fondateur d'Ace Club, sur un court de tennis"
            className="rounded-[28px]"
          />

          <div>
            <p className="text-balance text-xl leading-relaxed text-mkt-fg sm:text-2xl">
              « Je m&apos;appelle Stanislas. J&apos;ai joué en club pendant
              seize ans et enseigné le tennis pendant trois ans. Partout,
              j&apos;ai vu les mêmes problèmes : des messages perdus, des
              partenaires introuvables, des outils pensés pour gérer, jamais
              pour donner envie de jouer. J&apos;ai créé Ace Club pour que
              jouer redevienne simple. Quand vous réservez une démo,
              c&apos;est moi qui vous réponds. »
            </p>
            <p className="mt-6 text-[15px] font-medium text-mkt-fg">
              Stanislas Gillyboeuf, fondateur d&apos;Ace Club
            </p>
            <p className="text-[14px] text-mkt-fg-dim">
              Joueur depuis 16 ans · Assistant moniteur de tennis
            </p>
            <Link
              href="/demo"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mkt-gradient mt-7 h-12 rounded-full px-8 text-[15px] font-semibold hover:opacity-90"
              )}
            >
              Réserver une démo avec moi
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] border border-mkt-border bg-mkt-bg-raised p-6 text-center"
            >
              <h3 className="text-[15px] font-semibold">{card.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-mkt-fg-dim">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ImageSlot } from "@/components/ui/image-slot";

export function FounderStory() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center sm:flex-row sm:items-start sm:text-left">
        <ImageSlot
          ratio="founder"
          alt="Stanislas, fondateur d'Ace Club, sur un court de tennis"
          className="w-24 shrink-0 sm:w-28"
        />
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Qui est derrière Ace Club
          </span>
          <p className="mt-5 text-balance text-xl leading-relaxed text-mkt-fg-dim sm:text-2xl">
            Je m&apos;appelle Stanislas. J&apos;ai passé seize ans à jouer en
            club et trois ans à enseigner le tennis. J&apos;ai vu les mêmes
            problèmes revenir partout : des messages perdus, des partenaires
            introuvables, des outils qui gèrent sans jamais donner envie de
            jouer. J&apos;ai créé Ace Club pour que jouer redevienne simple.
            Quand vous réservez une démo, c&apos;est moi que vous avez en face
            de vous.
          </p>
          <p className="mt-6 text-[15px] font-medium text-mkt-fg">
            Stanislas, fondateur d&apos;Ace Club
          </p>
          <Link
            href="/a-propos"
            className="mt-2 inline-block text-[14px] font-medium text-mkt-accent underline underline-offset-4 hover:opacity-80"
          >
            Mon histoire →
          </Link>
        </div>
      </div>
    </section>
  );
}

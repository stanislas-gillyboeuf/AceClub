import { CTA } from "@/components/sections/cta";
import { ImageSlot } from "@/components/ui/image-slot";
import { TodoNote } from "@/components/ui/todo-note";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "À propos",
  description:
    "Pourquoi j'ai créé Ace Club : mon parcours de joueur et d'enseignant de tennis, et ce que je promets aux clubs pilotes.",
});

export default function AProposPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-20 sm:pt-28">
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          Mon histoire
        </span>
        <h1 className="mx-auto mt-3 max-w-xl text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Pourquoi j&apos;ai créé Ace Club
        </h1>

        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ImageSlot
            ratio="founder"
            alt="Stanislas, fondateur d'Ace Club, sur un court de tennis"
            className="w-28 shrink-0"
          />
          <div className="space-y-6 text-[17px] leading-relaxed text-mkt-fg-dim">
            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Mon parcours
              </h2>
              <p className="mt-3">
                Je m&apos;appelle Stanislas. J&apos;ai passé seize ans à jouer
                en club et trois ans à enseigner le tennis. J&apos;ai vu les
                mêmes problèmes revenir partout : des messages perdus, des
                partenaires introuvables, des outils qui gèrent sans jamais
                donner envie de jouer.{" "}
                <TodoNote>anecdote personnelle et photo</TodoNote>
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Pourquoi Ace Club
              </h2>
              <p className="mt-3">
                Les logiciels de club existants savent gérer : des courts,
                des membres, des cotisations. Mais aucun ne donne envie de
                jouer. J&apos;ai créé Ace Club pour combler ce manque : une
                application que les adhérents ouvrent parce qu&apos;ils ont
                envie, pas seulement pour réserver un créneau.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Ma conviction
              </h2>
              <blockquote className="mt-3 border-l-2 border-mkt-accent pl-5 text-xl font-medium text-mkt-fg">
                Un club vivant, ce n&apos;est pas un club mieux administré.
              </blockquote>
              <p className="mt-3">
                C&apos;est un club où jouer redevient simple : trouver un
                partenaire, s&apos;inscrire à un événement, suivre sa
                progression. L&apos;administration est un moyen, jamais le
                but.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Ce que je promets aux clubs pilotes
              </h2>
              <p className="mt-3">
                Vous avez un contact direct avec moi, pas un support générique
                : je configure votre club avec vous, j&apos;écoute ce qui ne
                fonctionne pas et j&apos;ajuste l&apos;app en conséquence.{" "}
                <TodoNote>
                  engagements précis pour les clubs pilotes (délais, niveau de
                  support)
                </TodoNote>
              </p>
            </section>
          </div>
        </div>
      </div>

      <CTA />
    </>
  );
}

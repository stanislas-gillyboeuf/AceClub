import { CTA } from "@/components/sections/cta";
import { ImageSlot } from "@/components/ui/image-slot";
import { TodoNote } from "@/components/ui/todo-note";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "À propos",
  description:
    "Ma conviction, mon parcours de joueur et d'enseignant de tennis, et ce que je promets aux clubs fondateurs d'Ace Club.",
});

export default function AProposPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-20 sm:pt-28">
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          Qui est derrière Ace Club
        </span>
        <h1 className="mx-auto mt-3 max-w-xl text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Créé par quelqu&apos;un qui connaît les clubs de l&apos;intérieur.
        </h1>

        <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ImageSlot
            ratio="square"
            alt="Stanislas, fondateur d'Ace Club, sur un court de tennis"
            className="w-32 shrink-0 rounded-[20px]"
          />
          <div className="space-y-6 text-[17px] leading-relaxed text-mkt-fg-dim">
            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Ma conviction
              </h2>
              <blockquote className="mt-3 border-l-2 border-mkt-accent pl-5 text-xl font-medium text-mkt-fg">
                Un club vivant, ce n&apos;est pas un club mieux administré.
              </blockquote>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Mon parcours
              </h2>
              <p className="mt-3">
                Je m&apos;appelle Stanislas. J&apos;ai joué en club pendant
                seize ans et enseigné le tennis pendant trois ans. Partout,
                j&apos;ai vu les mêmes problèmes : des messages perdus, des
                partenaires introuvables, des outils pensés pour gérer,
                jamais pour donner envie de jouer.{" "}
                <TodoNote>anecdote personnelle</TodoNote>
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Pourquoi Ace Club
              </h2>
              <p className="mt-3">
                J&apos;ai créé Ace Club pour que jouer redevienne simple. Pas
                un logiciel de gestion de plus, mais l&apos;outil qui donne
                envie à vos adhérents d&apos;ouvrir l&apos;application — pour
                réserver, trouver un partenaire, s&apos;inscrire à un
                événement. Quand vous réservez une démo, c&apos;est moi qui
                vous réponds.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight text-mkt-fg">
                Ce que je promets aux clubs fondateurs
              </h2>
              <ul className="mt-3 space-y-2">
                <li>
                  Un seul interlocuteur : le fondateur, du premier échange à
                  la mise en place.
                </li>
                <li>Une mise en place accompagnée, sans interrompre votre club.</li>
                <li>Vos données appartiennent à votre club.</li>
              </ul>
            </section>

            <p className="text-[15px] font-medium text-mkt-fg">
              Stanislas Gillyboeuf, fondateur d&apos;Ace Club
              <br />
              <span className="font-normal text-mkt-fg-dim">
                Joueur depuis 16 ans · Assistant moniteur de tennis
              </span>
            </p>
          </div>
        </div>
      </div>

      <CTA />
    </>
  );
}

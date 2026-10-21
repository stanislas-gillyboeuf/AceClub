import { ImageSlot } from "@/components/ui/image-slot";

export function FounderStory() {
  return (
    <section className="border-t border-mkt-border py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center sm:flex-row sm:items-start sm:text-left">
        <ImageSlot
          ratio="founder"
          alt="Stanislas, fondateur d'Ace Club"
          className="w-24 shrink-0 sm:w-28"
        />
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            Pourquoi Ace Club
          </span>
          <p className="mt-5 text-balance text-xl leading-relaxed text-mkt-fg-dim sm:text-2xl">
            Seize ans à jouer en club, trois ans à enseigner le tennis :
            j&apos;ai vu les mêmes douleurs revenir partout. La communication
            entre le club et ses adhérents qui passe par cent messages perdus.
            Trouver un partenaire de niveau qui devient une corvée au lieu
            d&apos;un réflexe. Des outils numériques pensés pour gérer, jamais
            pour donner envie de jouer.
            <br />
            <br />
            Un club vivant, ce n&apos;est pas un club mieux administré.
            C&apos;est un club où jouer redevient simple. J&apos;ai créé Ace
            Club pour ça.
          </p>
          <p className="mt-6 text-[15px] font-medium text-mkt-fg">
            Stanislas, fondateur d&apos;Ace Club
          </p>
        </div>
      </div>
    </section>
  );
}

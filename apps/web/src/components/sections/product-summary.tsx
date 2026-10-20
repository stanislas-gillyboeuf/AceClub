import Link from "next/link";
import { siteConfig } from "@/lib/config";

const FEATURES = [
  "Réservation de terrain de tennis et de padel",
  "Recherche de partenaire de jeu par niveau",
  "Messagerie intégrée entre membres",
  "Défis, récompenses et classement du club",
  "Tableau de bord de gestion pour les clubs",
];

export function ProductSummary() {
  return (
    <section className="border-t border-mkt-border py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-balance text-[17px] leading-relaxed text-mkt-fg-dim">
          <strong className="text-mkt-fg">Ace Club</strong> est une application de réservation de
          terrain, de mise en relation entre joueurs et de gestion de club, pensée pour les clubs
          de tennis et de padel et leurs adhérents. Les joueurs y réservent un terrain, trouvent un
          partenaire de leur niveau et suivent leur activité ; les clubs y gèrent leurs membres et
          leurs communications depuis un tableau de bord dédié. Le site ace-club.app propose aussi
          une page publique de prise de rendez-vous pour une démonstration de 20 minutes : les
          créneaux proposés et les rendez-vous créés s&apos;appuient sur Google Agenda, avec un
          lien Google Meet généré automatiquement.
        </p>

        <ul className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-mkt-fg-dim">
          {FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px]">
          <Link href="/privacy" className="text-mkt-fg-dim underline underline-offset-4 hover:text-mkt-fg">
            Confidentialité
          </Link>
          <Link href="/terms" className="text-mkt-fg-dim underline underline-offset-4 hover:text-mkt-fg">
            Conditions d&apos;utilisation
          </Link>
          <a
            href={`mailto:${siteConfig.links.email}`}
            className="text-mkt-fg-dim underline underline-offset-4 hover:text-mkt-fg"
          >
            {siteConfig.links.email}
          </a>
        </div>
      </div>
    </section>
  );
}

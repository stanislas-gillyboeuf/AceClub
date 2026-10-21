import { CTA } from "@/components/sections/cta";
import {
  ADHERENT_FEATURES,
  CLUB_FEATURES,
  FeatureShowcase,
} from "@/components/sections/feature-showcase";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Produit",
  description:
    "Pour vos adhérents : réservation, partenaires, événements, classement. Pour votre club : synchronisation ADOC, gestion des courts, communication centralisée.",
});

function PartTitle({
  eyebrow,
  title,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-8 pt-20 text-center sm:pt-28">
      <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
        {eyebrow}
      </span>
      <Heading className="mx-auto mt-3 text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
        {title}
      </Heading>
    </div>
  );
}

export default function ProduitPage() {
  return (
    <>
      <PartTitle as="h1" eyebrow="Produit" title="Pour vos adhérents" />
      <FeatureShowcase features={ADHERENT_FEATURES} />

      <div className="border-t border-mkt-border">
        <PartTitle eyebrow="Produit" title="Pour votre club" />
        <FeatureShowcase features={CLUB_FEATURES} />
      </div>

      <CTA />
    </>
  );
}

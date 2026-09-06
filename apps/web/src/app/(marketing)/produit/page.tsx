import { CTA } from "@/components/sections/cta";
import { Engagement } from "@/components/sections/engagement";
import { FeatureShowcase } from "@/components/sections/feature-showcase";
import { HowItWorks } from "@/components/sections/how-it-works";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Produit",
  description: "Trouver un partenaire, réserver un terrain, suivre ses matchs — tout ce qu'Ace Club apporte à votre club.",
});

export default function ProduitPage() {
  return (
    <>
      <div className="mx-auto max-w-[var(--max-container-width)] px-6 pt-24 pb-8 text-center sm:pt-32">
        <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
          Produit
        </span>
        <h1 className="mx-auto mt-3 max-w-2xl text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Ce qui fait jouer vos adhérents
        </h1>
      </div>
      <FeatureShowcase />
      <Engagement />
      <HowItWorks />
      <CTA />
    </>
  );
}

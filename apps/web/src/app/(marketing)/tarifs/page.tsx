import { DemoForm } from "@/components/sections/demo-form";
import { Pricing } from "@/components/sections/pricing";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Tarifs",
  description: "Un tarif simple basé sur la taille de votre club. Gratuit pour tous vos adhérents.",
});

export default function TarifsPage() {
  return (
    <div className="mkt-light-section">
      <Pricing />

      <section id="demo" className="scroll-mt-24 border-t border-mkt-light-border py-20 sm:py-28">
        <div className="mx-auto max-w-xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
              Réservez votre démo
            </h2>
            <p className="mt-4 text-balance text-lg text-mkt-light-fg-dim">
              Parlez-nous de votre club — on revient vers vous rapidement.
            </p>
          </div>
          <DemoForm />
        </div>
      </section>
    </div>
  );
}

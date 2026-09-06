import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "FAQ",
  description: "Réponses aux questions fréquentes des clubs sur Ace Club.",
});

export default function FAQPage() {
  return (
    <>
      <div className="mkt-light-section">
        <FAQ />
      </div>
      <CTA />
    </>
  );
}

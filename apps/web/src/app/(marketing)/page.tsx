import { AudienceSplit } from "@/components/sections/audience-split";
import { CTA } from "@/components/sections/cta";
import { ExistingSoftwareBridge } from "@/components/sections/existing-software-bridge";
import { FAQ } from "@/components/sections/faq";
import { FounderStory } from "@/components/sections/founder-story";
import { Hero } from "@/components/sections/hero";
import { SocialProof } from "@/components/sections/social-proof";
import { TrialBanner } from "@/components/sections/trial-banner";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Remplissez vos courts, simplifiez votre club",
  description:
    "L'appli qui fait jouer vos adhérents et le dashboard qui fait gagner du temps aux clubs de tennis et padel. 3 mois offerts — réservez une démo.",
});

export default function Home() {
  return (
    <>
      <Hero />
      <TrialBanner />
      <SocialProof />
      <AudienceSplit />
      <ExistingSoftwareBridge />
      <FounderStory />
      <div className="mkt-light-section">
        <FAQ />
      </div>
      <CTA />
    </>
  );
}

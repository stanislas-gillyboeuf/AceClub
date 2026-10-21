import { AdherentFeatures } from "@/components/sections/adherent-features";
import { ClubDashboard } from "@/components/sections/club-dashboard";
import { CTA } from "@/components/sections/cta";
import { ExistingSoftwareBridge } from "@/components/sections/existing-software-bridge";
import { FaqPreview } from "@/components/sections/faq-preview";
import { FounderStory } from "@/components/sections/founder-story";
import { Hero } from "@/components/sections/hero";
import { LaunchOffer } from "@/components/sections/launch-offer";
import { OnboardingSteps } from "@/components/sections/onboarding-steps";
import { OneLiner } from "@/components/sections/one-liner";
import { ProblemSection } from "@/components/sections/problem-section";
import { SocialProof } from "@/components/sections/social-proof";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "L'appli qui fait jouer vos adhérents",
  description:
    "Réservation, partenaires de niveau, événements, classement : Ace Club fait jouer vos adhérents et donne un tableau de bord à votre club de tennis ou padel. 3 mois offerts.",
});

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <OneLiner />
      <OnboardingSteps />
      <AdherentFeatures />
      <ClubDashboard />
      <ExistingSoftwareBridge />
      <FounderStory />
      <SocialProof />
      <LaunchOffer />
      <FaqPreview />
      <CTA />
    </>
  );
}

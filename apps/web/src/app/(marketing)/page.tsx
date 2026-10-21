import { AdherentFeatures } from "@/components/sections/adherent-features";
import { ClubDashboard } from "@/components/sections/club-dashboard";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { FounderStory } from "@/components/sections/founder-story";
import { FoundingClubsBanner } from "@/components/sections/founding-clubs-banner";
import { Hero } from "@/components/sections/hero";
import { TwoWaysToStart } from "@/components/sections/two-ways-to-start";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "L'application qui anime votre club de tennis & padel",
  description:
    "Réservation de courts, partenaires de niveau, événements, classement, et un tableau de bord pour piloter votre club — synchronisé avec ADOC en 5 minutes. 3 mois offerts.",
});

export default function Home() {
  return (
    <>
      <Hero />
      <FoundingClubsBanner />
      <AdherentFeatures />
      <ClubDashboard />
      <TwoWaysToStart />
      <FounderStory />
      <FAQ />
      <CTA />
    </>
  );
}

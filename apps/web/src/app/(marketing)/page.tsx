import { CTA } from "@/components/sections/cta";
import { FounderStory } from "@/components/sections/founder-story";
import { Hero } from "@/components/sections/hero";
import { ProductSummary } from "@/components/sections/product-summary";
import { ProductTeaser } from "@/components/sections/product-teaser";
import { TrialBanner } from "@/components/sections/trial-banner";

export default function Home() {
  return (
    <>
      <Hero />
      <TrialBanner />
      <ProductSummary />
      <ProductTeaser />
      <FounderStory />
      <CTA />
    </>
  );
}

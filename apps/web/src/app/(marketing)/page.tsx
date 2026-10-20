import { CTA } from "@/components/sections/cta";
import { FounderStory } from "@/components/sections/founder-story";
import { Hero } from "@/components/sections/hero";
import { ProductSummary } from "@/components/sections/product-summary";
import { ProductTeaser } from "@/components/sections/product-teaser";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductSummary />
      <ProductTeaser />
      <FounderStory />
      <CTA />
    </>
  );
}

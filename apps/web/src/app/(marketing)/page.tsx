import { CTA } from "@/components/sections/cta";
import { FounderStory } from "@/components/sections/founder-story";
import { Hero } from "@/components/sections/hero";
import { ProductTeaser } from "@/components/sections/product-teaser";
import { Traction } from "@/components/sections/traction";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductTeaser />
      <Traction />
      <FounderStory />
      <CTA />
    </>
  );
}

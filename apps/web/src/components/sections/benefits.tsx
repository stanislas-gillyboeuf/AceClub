/* eslint-disable @next/next/no-img-element */
"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";

export function Benefits() {
  return (
    <Section
      title="Avantages"
      subtitle={`Ce que ${siteConfig.name} vous apporte`}
      className="max-w-screen-xl mx-auto container px-6 md:px-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative">
          <img
            src="/Device-8.png"
            alt="Ace Club application"
            className="w-full max-w-md mx-auto rounded-3xl object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-foreground font-medium">
            Ace Club aide les clubs à faire jouer plus souvent leurs adhérents
            et à renforcer l&apos;engagement au quotidien.
          </p>
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-foreground font-semibold">
            Parce qu&apos;un club vivant, c&apos;est avant tout des joueurs qui
            jouent.
          </p>
        </div>
      </div>
    </Section>
  );
}

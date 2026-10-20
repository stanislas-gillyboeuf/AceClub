"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

const CAL_BOOKING_URL = "https://cal.com/stanislas-gillyboeuf-4jzcfr/30min";

function buildEmbedUrl(utmSource: string | null): string {
  if (!utmSource) return CAL_BOOKING_URL;
  const params = new URLSearchParams({ utm_source: utmSource });
  return `${CAL_BOOKING_URL}?${params.toString()}`;
}

function DemoBookingContent() {
  const searchParams = useSearchParams();
  const embedUrl = buildEmbedUrl(searchParams.get("utm_source"));
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl px-6 pb-8 pt-16 text-center sm:pt-24">
        <Icons.logo className="mx-auto h-12 w-12 rounded-[10px]" />
        <h1 className="mt-6 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
          Réservez votre démo d&apos;Ace Club
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-mkt-light-fg-dim">
          30 minutes en visioconférence avec Stan, le fondateur d&apos;Ace Club — 3 mois gratuits
          pour tester l&apos;application avec votre club.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-4xl flex-1 px-0 pb-10 sm:px-6">
        {!loaded && (
          <Skeleton className="absolute inset-x-0 top-0 h-[80vh] min-h-[640px] w-full sm:rounded-2xl" />
        )}
        <iframe
          src={embedUrl}
          title="Réserver une démo Ace Club sur Cal.com"
          className="h-[80vh] min-h-[640px] w-full border-0 bg-transparent sm:rounded-2xl sm:border sm:border-mkt-light-border"
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="pb-12 text-center">
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-mkt-light-fg-dim underline underline-offset-4 hover:text-mkt-light-fg"
        >
          Ouvrir dans un nouvel onglet
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export function DemoBookingEmbed() {
  return (
    <Suspense fallback={null}>
      <DemoBookingContent />
    </Suspense>
  );
}

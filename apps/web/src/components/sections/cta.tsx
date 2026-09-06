import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CTA() {
  return (
    <section className="border-t border-mkt-border">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6 py-24 sm:py-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[32px] border border-mkt-border bg-mkt-bg-raised px-8 py-16 text-center sm:py-20">
          <h2 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
            Faites jouer votre club
          </h2>
          <p className="mt-5 max-w-md text-balance text-[17px] text-mkt-fg-dim">
            Parlons de votre club et voyons ensemble comment Ace Club peut
            s&apos;intégrer dès la prochaine saison.
          </p>
          <Link
            href="/tarifs#demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 h-12 rounded-full bg-mkt-accent px-7 text-[15px] font-semibold text-mkt-accent-foreground hover:bg-mkt-accent/90"
            )}
          >
            {siteConfig.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

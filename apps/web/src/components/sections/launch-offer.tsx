import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function LaunchOffer() {
  return (
    <section className="mkt-gradient py-20 sm:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
          3 mois offerts, puis un tarif adapté à la taille de votre club.
        </h2>
        <Link
          href="/demo"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 h-12 rounded-full bg-mkt-fg px-7 text-[15px] font-semibold text-mkt-bg hover:bg-mkt-fg/90"
          )}
        >
          {siteConfig.cta}
        </Link>
      </div>
    </section>
  );
}

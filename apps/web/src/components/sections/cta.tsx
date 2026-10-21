import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TodoNote } from "@/components/ui/todo-note";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="mkt-gradient py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
          Faites jouer votre club.
        </h2>
        <p className="mt-5 max-w-md text-balance text-[17px] opacity-90">
          30 minutes en visio, sans engagement. On regarde votre club
          ensemble.
        </p>
        <Link
          href="/demo"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 h-12 rounded-full bg-mkt-fg px-7 text-[15px] font-semibold text-mkt-bg hover:bg-mkt-fg/90"
          )}
        >
          {siteConfig.cta}
        </Link>
        <p className="mt-6 text-[14px] font-medium opacity-90">
          3 mois offerts · Synchronisation ADOC en 5 min
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[14px] opacity-80">
          <a href={`mailto:${siteConfig.links.email}`} className="hover:underline">
            {siteConfig.links.email}
          </a>
          <span>·</span>
          <TodoNote invert>téléphone du fondateur</TodoNote>
        </div>
      </div>
    </section>
  );
}

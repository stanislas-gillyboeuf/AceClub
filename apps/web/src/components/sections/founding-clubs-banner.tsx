import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SHOW_SOCIAL_PROOF, siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function FoundingClubsBanner() {
  return (
    <section className="border-y border-mkt-border bg-mkt-accent/10">
      <div className="mx-auto flex max-w-[var(--max-container-width)] flex-col items-center gap-5 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="max-w-2xl text-[15px] leading-relaxed text-mkt-fg">
          <span className="font-semibold">Programme clubs fondateurs.</span>{" "}
          Les premiers clubs qui rejoignent Ace Club bénéficient de 3 mois
          offerts et d&apos;un accompagnement direct par le fondateur.
        </p>

        <div className="flex shrink-0 items-center gap-6">
          {SHOW_SOCIAL_PROOF && (
            <div className="hidden items-center gap-4 opacity-70 sm:flex">
              {/* Logos des clubs fondateurs — voir IMAGES.md */}
            </div>
          )}
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0 rounded-full bg-mkt-fg px-5 text-mkt-bg hover:bg-mkt-fg/90"
            )}
          >
            {siteConfig.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config";

export function FaqPreview() {
  const faqs = siteConfig.faqs.filter((faq) => faq.showOnHome);

  return (
    <section className="border-t border-mkt-border py-20 sm:py-28">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            FAQ
          </span>
          <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            Questions fréquentes
          </h2>
        </div>

        <Accordion type="single" collapsible className="mx-auto mt-12 w-full max-w-2xl">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-mkt-border">
              <AccordionTrigger className="text-left text-[16px] font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-mkt-fg-dim">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="text-[14px] font-semibold text-mkt-accent underline underline-offset-4 hover:opacity-80"
          >
            Voir toutes les questions →
          </Link>
        </div>
      </div>
    </section>
  );
}

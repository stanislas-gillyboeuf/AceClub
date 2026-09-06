import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config";

export function FAQ() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-mkt-accent">
            FAQ
          </span>
          <h1 className="mt-3 text-balance font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
            Questions fréquentes
          </h1>
        </div>

        <Accordion type="single" collapsible className="mx-auto mt-12 w-full max-w-2xl">
          {siteConfig.faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-mkt-light-border">
              <AccordionTrigger className="text-left text-[16px] font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-mkt-light-fg-dim">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

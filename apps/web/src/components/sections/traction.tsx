"use client";

import { Trajectory } from "@/components/graphics/trajectory";
import { easeOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv } from "@/lib/motion";

/**
 * Real, aggregate numbers only — never invented. Each stat renders its placeholder
 * copy (visibly marked as a draft) until siteConfig.traction gets a real `value`.
 */
export function Traction() {
  return (
    <section className="relative border-t border-mkt-border py-24 sm:py-32">
      <Trajectory className="absolute left-1/2 top-8 h-24 w-64 -translate-x-1/2 text-mkt-accent/30" />

      <div className="mx-auto max-w-[var(--max-container-width)] px-6">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
          {siteConfig.traction.map((stat, index) => (
            <MotionDiv
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutCubic }}
              className="text-center"
            >
              {stat.value != null ? (
                <div className="font-display text-6xl leading-none text-mkt-accent">{stat.value}</div>
              ) : (
                <div className="mx-auto w-fit rounded-lg border border-dashed border-mkt-fg/25 px-3 py-1.5 font-mono text-[13px] text-mkt-fg/40">
                  {stat.placeholder}
                </div>
              )}
              <p className="mt-3 text-[15px] text-mkt-fg-dim">{stat.label}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

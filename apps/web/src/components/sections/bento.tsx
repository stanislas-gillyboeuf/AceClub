"use client";

import { Section } from "@/components/section";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { MotionDiv } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

export function BentoGrid() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  const opacities = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.4, 0.6], [0, 0, 1], {
      ease: easeInOutCubic,
    }),
  ];

  const yTransforms = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.3, 0.5], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
    useTransform(scrollYProgress, [0, 0.4, 0.6], [100, 100, 0], {
      ease: easeInOutCubic,
    }),
  ];

  return (
    <Section
      id="bento"
      title="Avantages"
      subtitle="Tout ce que l'app peut faire"
      className="mx-auto max-w-screen-md px-10"
      ref={ref}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {siteConfig.bento.map((bentoItem, index) => (
          <MotionDiv
            key={index}
            style={{ opacity: opacities[index], y: yTransforms[index] }}
            className={cn(
              "bg-muted p-4 sm:p-6 !pb-0 rounded-3xl grid grid-rows-1",
              bentoItem.fullWidth && "md:col-span-2",
            )}
          >
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                {bentoItem.title}
              </h2>
              <p className="text-sm sm:text-base text-foreground mb-4">{bentoItem.content}</p>
            </div>
            <div className={cn("flex justify-center", bentoItem.fullWidth && "sm:space-x-4")}>
              <img
                src={bentoItem.imageSrc}
                alt={bentoItem.imageAlt}
                className="w-full h-64 sm:h-96 rounded-xl object-cover object-top"
              />
            </div>
          </MotionDiv>
        ))}
      </div>
    </Section>
  );
}

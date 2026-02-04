"use client";

import { Section } from "@/components/section";
import { easeOutCubic } from "@/lib/animation";
import { MotionImg } from "@/lib/motion";
import { useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

export function FeatureScroll() {
  const phone1Ref = useRef<HTMLImageElement>(null);
  const phone2Ref = useRef<HTMLImageElement>(null);
  const phone3Ref = useRef<HTMLImageElement>(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: phone1Ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: phone2Ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: phone3Ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress1, [0, 0.3], [150, 0], {
    ease: easeOutCubic,
  });
  const y2 = useTransform(scrollYProgress2, [0.1, 0.4], [200, 0], {
    ease: easeOutCubic,
  });
  const y3 = useTransform(scrollYProgress3, [0.2, 0.5], [250, 0], {
    ease: easeOutCubic,
  });

  return (
    <Section
      id="feature-scroll"
      title="Expérience"
      subtitle="Une app comme aucune autre"
      className="container px-4 sm:px-10 mx-auto max-w-[var(--max-container-width)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mx-auto select-none">
        <MotionImg
          ref={phone1Ref as React.Ref<HTMLImageElement>}
          src="/Device-6.png"
          alt="Capture AceClub 1"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y1 }}
        />
        <MotionImg
          ref={phone2Ref as React.Ref<HTMLImageElement>}
          src="/Device-7.png"
          alt="Capture AceClub 2"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y2 }}
        />
        <MotionImg
          ref={phone3Ref as React.Ref<HTMLImageElement>}
          src="/Device-8.png"
          alt="Capture AceClub 3"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y3 }}
        />
      </div>
    </Section>
  );
}

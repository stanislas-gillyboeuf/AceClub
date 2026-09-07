"use client";

import { AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { easeOutCubic } from "@/lib/animation";
import { MotionImg } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { image: "/screenshot-booking.png", label: "Choisir son créneau" },
  { image: "/screenshot-booking-partner.png", label: "Ajouter un partenaire" },
  { image: "/screenshot-booking-confirm.png", label: "Réservation confirmée" },
];

const STEP_DURATION_MS = 2600;

export function BookingStepsPhone() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const step = STEPS[index];

  return (
    <div className="overflow-hidden rounded-[28px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
      <div className="relative aspect-[1170/2532] w-full">
        <AnimatePresence mode="wait">
          <MotionImg
            key={step.image}
            src={step.image}
            alt={step.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: easeOutCubic }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-mkt-border px-4 py-3">
        {STEPS.map((s, i) => (
          <span
            key={s.image}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-5 bg-mkt-accent" : "w-1.5 bg-mkt-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

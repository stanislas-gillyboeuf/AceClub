"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import { easeInOutCubic } from "@/lib/animation";
import { MotionDiv, MotionH1, MotionImg, MotionP } from "@/lib/motion";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";

export function Hero() {
  const { scrollY } = useScroll({
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollY, [0, 300], [100, 0]);
  const y2 = useTransform(scrollY, [0, 300], [50, 0]);
  const y3 = useTransform(scrollY, [0, 300], [0, 0]);
  const y4 = useTransform(scrollY, [0, 300], [50, 0]);
  const y5 = useTransform(scrollY, [0, 300], [100, 0]);

  return (
    <Section id="hero" className="min-h-[100vh] w-full overflow-hidden relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px]" />
      </div>

      <main className="mx-auto pt-16 sm:pt-24 md:pt-32 text-center relative px-4 z-10">
        {/* Logo section */}
        <div className="relative">
          <MotionDiv
            initial={{ scale: 5, height: "85vh" }}
            animate={{ scale: 1, height: "auto" }}
            transition={{
              scale: { delay: 0, duration: 2, ease: easeInOutCubic },
              height: { delay: 0, duration: 2, ease: easeInOutCubic },
            }}
            className="mb-12 relative z-20"
            style={{ transformOrigin: "top" }}
          >
            <div className="h-20 w-20 flex items-center justify-center mx-auto overflow-hidden shadow-lg rounded-xl">
              <Icons.logo className="h-20 w-20 object-cover rounded-xl" />
            </div>
          </MotionDiv>
        </div>

        <div className="max-w-5xl mx-auto">
          <MotionH1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: easeInOutCubic }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-6"
          >
            L'app qui <span className="text-primary">connecte</span>
            <br />
            les joueurs de votre club
          </MotionH1>

          <MotionP
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: easeInOutCubic }}
            className="max-w-2xl mx-auto text-lg sm:text-xl mb-10 text-muted-foreground text-balance"
          >
            Fini les groupes WhatsApp surchargés. Trouvez des partenaires, organisez des matchs et
            vivez pleinement votre club.
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex justify-center mb-16"
          >
            <Link
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105 active:scale-98"
            >
              <img
                src="/download-black.svg"
                alt="Télécharger sur l'App Store"
                className="w-40 flex-shrink-0 dark:hidden block"
              />
              <img
                src="/download-white.svg"
                alt="Télécharger sur l'App Store"
                className="w-40 flex-shrink-0 hidden dark:block"
              />
            </Link>
          </MotionDiv>
        </div>

        {/* Device showcase */}
        <div className="flex flex-nowrap items-end justify-center gap-2 sm:gap-4 md:gap-6 h-auto sm:h-[500px] select-none">
          <MotionImg
            src="/Device-1.png"
            alt="Capture d'écran AceClub"
            initial={{ opacity: 0, x: -200, rotate: -12 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            style={{ y: y1 }}
            transition={{ duration: 1, delay: 1.4, ease: easeInOutCubic }}
            className="hidden sm:block w-36 sm:w-48 md:w-56 h-auto flex-shrink-0 rounded-3xl shadow-xl"
          />
          <MotionImg
            src="/Device-2.png"
            alt="Capture d'écran AceClub"
            initial={{ opacity: 0, x: -100, rotate: -8 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            style={{ y: y2 }}
            transition={{ duration: 1, delay: 1.3, ease: easeInOutCubic }}
            className="w-40 sm:w-52 md:w-60 h-auto flex-shrink-0 rounded-3xl shadow-xl"
          />
          <MotionImg
            src="/Device-3.png"
            alt="Capture d'écran AceClub"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ y: y3 }}
            transition={{ duration: 1, delay: 1.2, ease: easeInOutCubic }}
            className="w-44 sm:w-56 md:w-64 h-auto flex-shrink-0 rounded-3xl shadow-xl z-10"
          />
          <MotionImg
            src="/Device-4.png"
            alt="Capture d'écran AceClub"
            initial={{ opacity: 0, x: 100, rotate: 8 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            style={{ y: y4 }}
            transition={{ duration: 1, delay: 1.3, ease: easeInOutCubic }}
            className="w-40 sm:w-52 md:w-60 h-auto flex-shrink-0 rounded-3xl shadow-xl"
          />
          <MotionImg
            src="/Device-5.png"
            alt="Capture d'écran AceClub"
            initial={{ opacity: 0, x: 200, rotate: 12 }}
            animate={{ opacity: 1, x: 0, rotate: 6 }}
            style={{ y: y5 }}
            transition={{ duration: 1, delay: 1.4, ease: easeInOutCubic }}
            className="hidden sm:block w-36 sm:w-48 md:w-56 h-auto flex-shrink-0 rounded-3xl shadow-xl"
          />
        </div>
      </main>
    </Section>
  );
}

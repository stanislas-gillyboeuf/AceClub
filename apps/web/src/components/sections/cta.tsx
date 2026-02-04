/* eslint-disable @next/next/no-img-element */
import Marquee from "@/components/ui/marquee";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, HeartHandshake } from "lucide-react";

const reviews = [
  {
    name: "Marie D.",
    username: "@tc_boulogne",
    body: "AceClub a révolutionné notre club. Les membres jouent 3 fois plus qu'avant !",
    img: "https://avatar.vercel.sh/marie",
  },
  {
    name: "Thomas M.",
    username: "@padel_lyon",
    body: "Je trouve des partenaires en 5 minutes. Fini le chaos WhatsApp !",
    img: "https://avatar.vercel.sh/thomas",
  },
  {
    name: "Sophie B.",
    username: "@tc_nantes",
    body: "Interface intuitive. Même les moins connectés l'utilisent facilement.",
    img: "https://avatar.vercel.sh/sophie",
  },
  {
    name: "Pierre D.",
    username: "@tc_marseille",
    body: "Les défis hebdomadaires motivent vraiment nos membres. Top !",
    img: "https://avatar.vercel.sh/pierre",
  },
  {
    name: "Camille R.",
    username: "@padel_toulouse",
    body: "Tout est centralisé, plus de mails perdus. C'est parfait.",
    img: "https://avatar.vercel.sh/camille",
  },
  {
    name: "Laurent P.",
    username: "@padel_paris",
    body: "Le support est réactif et à l'écoute. Service au top !",
    img: "https://avatar.vercel.sh/laurent",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-[2rem] border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function CTA() {
  return (
    <section id="cta">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4 mx-auto max-w-[var(--max-container-width)]">
          <div className="relative flex w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
            <div className="absolute rotate-[35deg]">
              <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
                {firstRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                className="[--duration:20s]"
                repeat={3}
              >
                {secondRow.map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
            </div>
            <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32">
              <HeartHandshake className="mx-auto size-16 text-black dark:text-white lg:size-24" />
            </div>
            <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
              <h1 className="text-3xl font-bold lg:text-4xl">
                Rejoignez la révolution des clubs connectés
              </h1>
              <p className="mt-2">
                Votre club mérite une app moderne. Contactez-nous pour en savoir plus.
              </p>
              <a
                href="/contact"
                className={cn(
                  buttonVariants({
                    size: "lg",
                    variant: "outline",
                  }),
                  "group mt-4 rounded-[2rem] px-6"
                )}
              >
                Nous contacter
                <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
              </a>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
          </div>
        </div>
      </div>
    </section>
  );
}

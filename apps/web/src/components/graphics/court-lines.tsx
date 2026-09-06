import { cn } from "@/lib/utils";

/** Abstract tennis/padel court lines — decorative background texture, never a literal court illustration. */
export function CourtLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 700"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn("pointer-events-none", className)}
    >
      <rect x="60" y="60" width="1080" height="580" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="220" x2="1140" y2="220" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="480" x2="1140" y2="480" stroke="currentColor" strokeWidth="1.5" />
      <line x1="600" y1="60" x2="600" y2="220" stroke="currentColor" strokeWidth="1.5" />
      <line x1="600" y1="480" x2="600" y2="640" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="350" x2="1140" y2="350" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" />
    </svg>
  );
}

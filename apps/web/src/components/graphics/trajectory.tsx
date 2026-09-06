import { cn } from "@/lib/utils";

/** Abstract ball-trajectory arc with an accent dot at the apex — decorative only. */
export function Trajectory({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      aria-hidden
      className={cn("pointer-events-none", className)}
    >
      <path
        d="M10 190 C 120 10, 280 10, 390 190"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      <circle cx="200" cy="24" r="5" fill="currentColor" />
    </svg>
  );
}

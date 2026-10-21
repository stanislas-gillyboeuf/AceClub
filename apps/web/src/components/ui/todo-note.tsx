import { cn } from "@/lib/utils";

interface TodoNoteProps {
  children: string;
  className?: string;
  /** Set when the surrounding section is a dark .mkt-gradient block — swaps to
   * light-on-dark colors so the pill stays legible instead of dark-on-dark. */
  invert?: boolean;
}

/** Visible inline marker for content that hasn't been provided yet — never silently invented.
 * Every instance must also be listed in TODO.md. */
export function TodoNote({ children, className, invert }: TodoNoteProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed px-2.5 py-0.5 text-[12px] font-medium",
        invert
          ? "border-white/50 bg-white/10 text-white/80"
          : "border-mkt-accent/70 bg-mkt-accent/10 text-mkt-fg/70",
        className,
      )}
    >
      [À COMPLÉTER : {children}]
    </span>
  );
}

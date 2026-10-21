import { cn } from "@/lib/utils";

interface TodoNoteProps {
  children: string;
  className?: string;
}

/** Visible inline marker for content that hasn't been provided yet — never silently invented.
 * Every instance must also be listed in TODO.md. */
export function TodoNote({ children, className }: TodoNoteProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-mkt-accent/70 bg-mkt-accent/10 px-2.5 py-0.5 text-[12px] font-medium text-mkt-fg/70",
        className,
      )}
    >
      [À COMPLÉTER : {children}]
    </span>
  );
}

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImageSlotRatio = "phone" | "tablet" | "square" | "founder" | "wide";

const RATIO_CLASSES: Record<ImageSlotRatio, string> = {
  phone: "aspect-[9/19.5]",
  tablet: "aspect-[16/11]",
  square: "aspect-square",
  founder: "aspect-square rounded-full",
  wide: "aspect-[16/9]",
};

interface ImageSlotProps {
  ratio: ImageSlotRatio;
  alt: string;
  /** Omit until the real photo is dropped into /public/images (see IMAGES.md) — renders a
   * neutral placeholder at the correct ratio instead, so there's never a layout shift once
   * the real image is wired in. */
  src?: string;
  className?: string;
  placeholderLabel?: string;
}

export function ImageSlot({
  ratio,
  alt,
  src,
  className,
  placeholderLabel = "Photo à venir",
}: ImageSlotProps) {
  const ratioClass = RATIO_CLASSES[ratio];

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex w-full items-center justify-center overflow-hidden border border-dashed border-mkt-border bg-mkt-bg-raised text-mkt-fg-dim",
          ratioClass,
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-[12px] font-medium">{placeholderLabel}</span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("w-full overflow-hidden object-cover", ratioClass, className)}
    />
  );
}

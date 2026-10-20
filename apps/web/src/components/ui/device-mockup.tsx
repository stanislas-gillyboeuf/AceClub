import { cn } from "@/lib/utils";
import { ImageSlot } from "./image-slot";

interface DeviceMockupProps {
  tabletSrc?: string;
  tabletAlt: string;
  phoneSrc?: string;
  phoneAlt: string;
  className?: string;
}

export function DeviceMockup({
  tabletSrc,
  tabletAlt,
  phoneSrc,
  phoneAlt,
  className,
}: DeviceMockupProps) {
  return (
    <div className={cn("relative mx-auto flex max-w-2xl items-end justify-center px-6", className)}>
      <div className="w-48 -rotate-3 overflow-hidden rounded-[24px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(10,40,20,0.35)] sm:w-64">
        <ImageSlot ratio="tablet" src={tabletSrc} alt={tabletAlt} />
      </div>
      <div className="-ml-8 w-28 rotate-3 overflow-hidden rounded-[24px] border border-mkt-border bg-mkt-bg-raised shadow-[0_30px_80px_-30px_rgba(10,40,20,0.4)] sm:-ml-10 sm:w-36">
        <ImageSlot ratio="phone" src={phoneSrc} alt={phoneAlt} />
      </div>
    </div>
  );
}

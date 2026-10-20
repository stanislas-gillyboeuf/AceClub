import { DemoBookingWidget } from "@/components/sections/demo-booking/demo-booking-widget";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Réserver une démo",
  description: "Choisissez un créneau de 20 minutes pour découvrir Ace Club en direct.",
});

export default function DemoPage() {
  return (
    <div className="mkt-light-section py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <DemoBookingWidget />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { DemoBookingEmbed } from "@/components/sections/demo-booking-embed";

export const metadata: Metadata = {
  title: "Réserver une démo",
  description: "Réservez votre démo Ace Club de 30 minutes avec Stanislas, fondateur d'Ace Club.",
};

export default function DemoPage() {
  return (
    <div className="mkt-light-section flex min-h-[70vh] flex-col">
      <DemoBookingEmbed />
    </div>
  );
}

import { Bebas_Neue } from "next/font/google";

/** Condensed, bold display face for headlines and big stat numbers — not body text. */
export const fontDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-raw",
});

import { Platform } from "react-native";

export const courtColors = {
  ink900: "#081814",
  ink800: "#0c221c",
  ink700: "#123027",
  ink650: "#173a2f",
  line: "#274f42",
  lineQuiet: "#1a3329",
  chalk: "#f3f1e6",
  chalkDim: "#b9c4bc",
  chalkFaint: "#5d6b64",
  chartreuse: "#d7ff3f",
  chartreuseDim: "#8fae2a",
  rust: "#e0673a",
  rustDim: "#7a4231",
  amber: "#e3b23c",
  amberDim: "#8a6a26",
} as const;

/** No custom family — the system font stack (San Francisco on iOS) matches the reference design. */
export const courtFontMono = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

/**
 * Flashy accent restored for the light-themed player screens (index/confirm/my-bookings/ticket/
 * book-for-club and their components) — the light background/card system stays, only the green
 * accent goes back to the original chartreuse instead of the muted brand green.
 */
export const bookingGreen = {
  /** Fills, borders, active backgrounds — the bright neon accent itself. */
  bright: courtColors.chartreuse,
  /** Standalone text/icons on a light background — chartreuse itself is unreadable there. */
  dim: courtColors.chartreuseDim,
  /** Text/icons drawn on top of a bright chartreuse fill. */
  onBright: courtColors.ink900,
} as const;

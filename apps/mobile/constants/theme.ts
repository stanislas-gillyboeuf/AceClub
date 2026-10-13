import { Platform } from "react-native";

/**
 * The app's single accent green has two variants so it can be swapped app-wide for a visual
 * test by changing ONE line (`ACTIVE_ACCENT` below) — nothing else needs to change.
 * `dim` is a readable-as-plain-text shade (the bright variant is too light to read as text),
 * `onBright` is the color to draw TEXT/ICONS on top of a solid `bright` fill (never hardcode
 * white there — use `colors.onAccentGreen` so it follows the swap).
 */
const accentGreenVariants = {
  muted: { bright: "#21874D", dim: "#21874D", onBright: "#FFFFFF" },
  flashy: { bright: "#d7ff3f", dim: "#8fae2a", onBright: "#081814" },
};
const ACTIVE_ACCENT = accentGreenVariants.flashy;

export const colors = {
  // Brand
  accentGreen: ACTIVE_ACCENT.bright,
  accentGreenDim: ACTIVE_ACCENT.dim,
  onAccentGreen: ACTIVE_ACCENT.onBright,
  accentOrange: "#E8832A",
  accentOrangeDark: "#F09B3E",

  // Neutrals
  black: "#000000",
  white: "#FFFFFF",

  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",

  // iOS System
  systemGray: "#8E8E93",

  // Feedback
  red50: "#fef2f2",
  red500: "#ef4444",

  // Surfaces
  warmBackground: "#FEF7ED",
} as const;

export const spacing = {
  horizontal: 20,
  card: 16,
  buttonVertical: 14,
  buttonHorizontal: 16,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const sizes = {
  buttonHeight: 52,
} as const;

/**
 * Frosted-glass (expo-blur BlurView) surfaces for photo-backed cards — the Liquid Glass
 * `GlassView` (expo-glass-effect, iOS 26+) is a different look reserved for standard controls;
 * these tokens are for the blurred panels/pills sitting over an event cover image.
 */
export const glass = {
  panelTint: { light: "rgba(255,255,255,0.55)", dark: "rgba(28,28,30,0.55)" },
  panelBorder: { light: "rgba(255,255,255,0.4)", dark: "rgba(255,255,255,0.16)" },
  pillTint: { light: "rgba(255,255,255,0.35)", dark: "rgba(0,0,0,0.35)" },
  pillBorder: { light: "rgba(255,255,255,0.5)", dark: "rgba(255,255,255,0.2)" },
  // Derived from the active accent (hex + alpha suffix, same convention as `${colors.red500}14`
  // elsewhere) so these follow `ACTIVE_ACCENT` automatically instead of drifting out of sync.
  accentTint: `${ACTIVE_ACCENT.bright}47`,
  accentBorder: `${ACTIVE_ACCENT.bright}A6`,
  // Android fallback (BlurView support is inconsistent there): a flat, ~85%-opaque surface —
  // the alpha lives in the color itself, never as a View `opacity` (that would also fade content).
  panelTintAndroidFallback: { light: "rgba(255,255,255,0.85)", dark: "rgba(28,28,30,0.85)" },
} as const;

/** Cover-less fallback backgrounds per event category — "Stage" needed a blue that didn't exist
 * anywhere else in the palette, added here rather than reusing an unrelated hue. */
export const eventCategoryColors = {
  tournament: { from: "#B5651D", to: "#8A4513" }, // terre battue
  party: "#0B3A2A", // vert foncé
  camp: "#2B5A8C", // bleu (nouveau — aucun bleu existant dans la palette)
} as const;

export const semanticColors = {
  cardBackground: { light: "#FFFFFF", dark: "#2C2C2E" },
  primaryBackground: { light: "#F2F2F7", dark: "#000000" },
  borderColor: { light: "#E5E5EA", dark: "#38383A" },
  labelPrimary: { light: "#000000", dark: "#FFFFFF" },
  labelSecondary: { light: "#8E8E93", dark: "#8E8E93" },
  labelTertiary: { light: "#C7C7CC", dark: "#48484A" },
  skeleton: { light: "#E5E5EA", dark: "#3A3A3C" },
  divider: { light: "#C6C6C8", dark: "#38383A" },
  incomingBubble: { light: "#E5E5EA", dark: "#26252A" },
  chatBackground: { light: "#FFFFFF", dark: "#000000" },
  systemGray5: { light: "#E5E5EA", dark: "#2C2C2E" },
  systemGray6: { light: "#F2F2F7", dark: "#1C1C1E" },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

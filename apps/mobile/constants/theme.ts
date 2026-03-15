import { Platform } from "react-native";

export const colors = {
  // Brand
  accentGreen: "#21874D",
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

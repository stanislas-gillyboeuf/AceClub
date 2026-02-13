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

  // Feedback
  red50: "#fef2f2",
  red500: "#ef4444",
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

// Legacy format used by tabs layout / other screens
export const Colors = {
  light: {
    text: colors.black,
    background: colors.white,
    tint: colors.accentGreen,
    icon: colors.gray500,
    tabIconDefault: colors.gray500,
    tabIconSelected: colors.accentGreen,
  },
  dark: {
    text: colors.white,
    background: "#151718",
    tint: colors.accentGreen,
    icon: colors.gray400,
    tabIconDefault: colors.gray400,
    tabIconSelected: colors.accentGreen,
  },
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

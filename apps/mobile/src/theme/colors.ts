export const colors = {
  primary: {
    DEFAULT: "#34C759",
    dark: "#30D158",
  },
  accent: {
    orange: "#FF9500",
    orangeDark: "#FF9F0A",
  },
  destructive: {
    DEFAULT: "#FF3B30",
    dark: "#FF453A",
  },
  bg: {
    primary: { light: "#F2F2F7", dark: "#000000" },
    secondary: { light: "#E5E5EA", dark: "#1C1C1E" },
    tertiary: { light: "#D1D1D6", dark: "#2C2C2E" },
    card: { light: "#FFFFFF", dark: "#2C2C2E" },
    input: { light: "#FFFFFF", dark: "#3A3A3C" },
  },
  border: {
    DEFAULT: { light: "#E5E5EA", dark: "#3A3A3C" },
    subtle: "rgba(138,138,142,0.3)",
  },
  label: {
    primary: { light: "#000000", dark: "#FFFFFF" },
    secondary: "#8E8E93",
    tertiary: { light: "#C7C7CC", dark: "#48484A" },
  },
} as const;

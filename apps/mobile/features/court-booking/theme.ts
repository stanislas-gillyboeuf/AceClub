import { colors } from "@/constants/theme";

/**
 * Thin re-export of the app's single shared accent (see `constants/theme.ts`'s `ACTIVE_ACCENT`)
 * — kept under this name only because every player-facing booking screen already imports
 * `bookingGreen` for its accent. There is no separate court-booking palette anymore: this
 * feature now follows the same accent, fonts and light/dark tokens as the rest of the app.
 */
export const bookingGreen = {
  bright: colors.accentGreen,
  dim: colors.accentGreenDim,
  onBright: colors.onAccentGreen,
} as const;

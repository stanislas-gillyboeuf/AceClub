import { semanticColors } from "@/constants/theme";

/**
 * Thin re-export of the app's single shared accent (see `constants/theme.ts`'s
 * `semanticColors.accentGreen`) — kept under this name only because every player-facing booking
 * screen already imports `bookingGreen` for its accent. There is no separate court-booking
 * palette anymore: this feature now follows the same accent, fonts and light/dark tokens as the
 * rest of the app. Each property is a `{ light, dark }` pair — index it with `[scheme]` at the
 * call site, same as any other `semanticColors.*` token.
 */
export const bookingGreen = {
  bright: semanticColors.accentGreen,
  dim: semanticColors.accentGreenDim,
  onBright: semanticColors.onAccentGreen,
} as const;

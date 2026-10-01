/**
 * Dedicated palette for the onboarding redesign (sport/level/photo/ready screens) — independent
 * of the app's light-themed `constants/theme.ts`, same pattern as
 * `features/court-booking/theme.ts`. The rest of the onboarding wizard (name/gender/birthdate/
 * club/notifications/location) keeps the existing light gradient and isn't affected.
 */
export const onboardingColors = {
  bg: "#0C4431",
  fg: "#F4F1E8",
  fgDim: "rgba(244,241,232,0.72)",
  accent: "#C9F169",
  accentForeground: "#0B3A2A",
  cardBg: "rgba(255,255,255,0.07)",
  cardBorder: "rgba(255,255,255,0.14)",
  cardBorderSelected: "#C9F169",
  cardBgSelected: "rgba(201,241,105,0.12)",
} as const;

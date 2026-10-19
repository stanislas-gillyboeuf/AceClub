/**
 * Temporary diagnostic logging for the cold-start photo bug (AUDIT.md section 1, Temps A).
 * Gated behind EXPO_PUBLIC_IMAGE_DEBUG rather than __DEV__ so it can be turned on in an actual
 * EAS build (a release bundle always has __DEV__ === false) — set only on the "imageDebug" eas.json
 * profile, never on "production". Remove this file and its call sites once Temps A is done, or
 * keep it behind the flag per the Temps B instruction.
 */
export const IMAGE_DEBUG = process.env.EXPO_PUBLIC_IMAGE_DEBUG === "1";

export function logImageEvent(tag: string, uri: string | null | undefined, event: string, detail?: unknown): void {
  if (!IMAGE_DEBUG) return;
  const ts = new Date().toISOString();
  console.log(`[ImageDebug][${tag}] ${event} @ ${ts} uri=${uri ?? "(none)"}`, detail ?? "");
}

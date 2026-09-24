import { ulid } from "ulid";

/** Addresses we fabricate for members who have no real email (typically children). They must never
 * be shown to a user nor written to: the mailer refuses them outright. */
export const GHOST_EMAIL_DOMAIN = "noreply.aceclub.app";

const GHOST_EMAIL_PREFIX = "ghost+";
const GHOST_EMAIL_SUFFIX = `@${GHOST_EMAIL_DOMAIN}`;

export function makeGhostEmail(): string {
  return `${GHOST_EMAIL_PREFIX}${ulid().toLowerCase()}${GHOST_EMAIL_SUFFIX}`;
}

export function isTechnicalEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.startsWith(GHOST_EMAIL_PREFIX) && normalized.endsWith(GHOST_EMAIL_SUFFIX);
}

/** The address to show in an API response: technical addresses are hidden (null). */
export function publicEmail(email: string | null | undefined): string | null {
  if (!email || isTechnicalEmail(email)) return null;
  return email;
}

/** SQL LIKE pattern matching a technical address, for excluding them from email searches. */
export const TECHNICAL_EMAIL_LIKE = `${GHOST_EMAIL_PREFIX}%${GHOST_EMAIL_SUFFIX}`;

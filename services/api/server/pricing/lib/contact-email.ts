import { isTechnicalEmail } from "../../../lib/technical-email";

export const NO_CONTACT_EMAIL_REASON = "Aucun email de contact";

export interface ContactEmailSources {
  ownEmail: string | null | undefined;
  householdContactEmail: string | null | undefined;
  payerEmail: string | null | undefined;
}

function usable(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  if (!trimmed || isTechnicalEmail(trimmed)) return null;
  return trimmed;
}

/** Where the club should write for a member: their own real email, else the household's contact
 * email, else the household payer's real email, else nobody (null — never a technical address). */
export function pickContactEmail(sources: ContactEmailSources): string | null {
  return usable(sources.ownEmail) ?? usable(sources.householdContactEmail) ?? usable(sources.payerEmail);
}

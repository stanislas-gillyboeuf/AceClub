/** Phone helpers (pure). Stored numbers were saved loosely (`+digits` or bare digits), so lookups use
 * every plausible stored form of the same number. */

function stripSeparators(raw: string): string {
  return raw.trim().replace(/[\s.\-()]/g, "");
}

/** E.164 (`+33612345678`) or null when the input is not a plausible phone number. French national
 * numbers (`06 12 34 56 78`) are read as +33. */
export function normalizePhoneE164(raw: string): string | null {
  const cleaned = stripSeparators(raw);
  if (!/^\+?\d+$/.test(cleaned) && !/^00\d+$/.test(cleaned)) return null;

  let digits: string;
  if (cleaned.startsWith("+")) digits = cleaned.slice(1);
  else if (cleaned.startsWith("00")) digits = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 10) digits = `33${cleaned.slice(1)}`;
  else if (cleaned.startsWith("33") && cleaned.length === 11) digits = cleaned;
  else return null;

  if (digits.startsWith("0")) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

/** Every form a stored number could have (`+33612345678`, `33612345678`, `0612345678`). */
export function phoneLookupCandidates(raw: string): string[] {
  const e164 = normalizePhoneE164(raw);
  if (!e164) return [];
  const digits = e164.slice(1);
  const forms = new Set<string>([e164, digits]);
  if (digits.startsWith("33") && digits.length === 11) forms.add(`0${digits.slice(2)}`);
  return [...forms];
}

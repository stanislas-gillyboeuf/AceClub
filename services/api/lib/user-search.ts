import { normalizePhoneE164, phoneLookupCandidates } from "./phone";

export type SearchQueryKind =
  | { kind: "empty" }
  | { kind: "email"; email: string }
  | { kind: "phone"; candidates: string[] }
  | { kind: "text"; text: string };

export const MIN_SEARCH_LENGTH = 2;
export const EXACT_SEARCHES_PER_HOUR = 20;

/** What a search box input is: an exact identifier (email/phone) or free text. */
export function classifySearchQuery(raw: string): SearchQueryKind {
  const q = raw.trim();
  if (q.length < MIN_SEARCH_LENGTH) return { kind: "empty" };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) return { kind: "email", email: q.toLowerCase() };
  if (normalizePhoneE164(q)) return { kind: "phone", candidates: phoneLookupCandidates(q) };
  return { kind: "text", text: q };
}

/** Escape `%`, `_` and `\` so free text cannot act as a LIKE pattern. */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (ch) => "\\" + ch);
}

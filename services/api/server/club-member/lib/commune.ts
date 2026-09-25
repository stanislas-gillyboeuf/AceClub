import { normalizeText } from "./plan-import";

export interface CommuneCandidate {
  nom: string;
  code: string;
}

export type CommunePick =
  | { status: "found"; code: string; name: string }
  | { status: "ambiguous" }
  | { status: "not_found" };

/** "St-Malo" and "Saint Malo" must compare equal: accents, case, hyphens and St/Ste abbreviations. */
export function normalizeCommuneName(value: string): string {
  return normalizeText(value)
    .replace(/\bst\b/g, "saint")
    .replace(/\bste\b/g, "sainte");
}

/**
 * Picks the commune out of the geo.api.gouv.fr candidates. Deliberately conservative: a wrong
 * INSEE code would silently give someone the wrong "resident" price, so anything that is not
 * clearly one commune is left empty (the club fills it in on the member file).
 */
export function pickCommune(candidates: CommuneCandidate[], wantedName?: string): CommunePick {
  const wanted = wantedName ? normalizeCommuneName(wantedName) : "";

  if (!wanted) {
    if (candidates.length === 1) return { status: "found", code: candidates[0].code, name: candidates[0].nom };
    return candidates.length === 0 ? { status: "not_found" } : { status: "ambiguous" };
  }

  const exact = candidates.filter((c) => normalizeCommuneName(c.nom) === wanted);
  if (exact.length === 1) return { status: "found", code: exact[0].code, name: exact[0].nom };
  if (exact.length > 1) return { status: "ambiguous" };

  if (candidates.length === 1) {
    const only = normalizeCommuneName(candidates[0].nom);
    if (only.includes(wanted) || wanted.includes(only)) {
      return { status: "found", code: candidates[0].code, name: candidates[0].nom };
    }
  }
  return { status: "not_found" };
}

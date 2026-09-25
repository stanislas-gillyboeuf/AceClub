import { normalizeCommuneName, pickCommune, type CommuneCandidate } from "../../server/club-member/lib/commune";

export type CityDecision =
  | { status: "write"; code: string; name: string }
  | { status: "ambiguous" }
  | { status: "not_found" }
  // A single candidate whose name only looks like the city: shown for a human to confirm, never written.
  | { status: "review"; code: string; name: string };

/** Case, accent, hyphen and St/Ste insensitive key: "St-Malo" and "saint malo" are one city. */
export function cityKey(city: string): string {
  return normalizeCommuneName(city);
}

/**
 * Stricter than the import's matching on purpose: a wrong INSEE code would silently give the
 * wrong "resident" price, so the script only writes when exactly one candidate has the same
 * normalized name as the free-text city.
 */
export function decideCityMigration(city: string, candidates: CommuneCandidate[]): CityDecision {
  const pick = pickCommune(candidates, city);
  if (pick.status === "ambiguous") return { status: "ambiguous" };
  if (pick.status === "not_found") return { status: "not_found" };
  if (cityKey(pick.name) === cityKey(city)) return { status: "write", code: pick.code, name: pick.name };
  return { status: "review", code: pick.code, name: pick.name };
}

export interface CityRow {
  id: string;
  city: string | null;
}

/** Rows grouped by normalized city so the geo API is called once per distinct city. */
export function groupRowsByCity(rows: CityRow[]): Map<string, { label: string; ids: string[] }> {
  const groups = new Map<string, { label: string; ids: string[] }>();
  for (const row of rows) {
    const label = row.city?.trim();
    if (!label) continue;
    const key = cityKey(label);
    if (!key) continue;
    const group = groups.get(key);
    if (group) group.ids.push(row.id);
    else groups.set(key, { label, ids: [row.id] });
  }
  return groups;
}

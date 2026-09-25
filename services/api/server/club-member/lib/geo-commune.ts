import { cacheGet, cacheSet } from "../../../lib/cache";
import { normalizeCommuneName, pickCommune, type CommuneCandidate } from "./commune";

/**
 * INSEE resolution of the (postal code, commune) pairs of an import, against the free and keyless
 * geo.api.gouv.fr. Runs BEFORE the import transaction: no network call ever happens inside one.
 * It never throws and never blocks the import: whatever cannot be resolved stays empty.
 */

export type CommuneResolution =
  | { status: "found"; code: string; name: string }
  | { status: "ambiguous" }
  | { status: "not_found" }
  | { status: "unavailable" };

export interface CommuneLookup {
  postalCode?: string;
  city?: string;
}

export interface GeoDeps {
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  concurrency?: number;
}

const GEO_URL = "https://geo.api.gouv.fr/communes";
const CACHE_TTL_SECONDS = 30 * 24 * 3600;
const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_CONCURRENCY = 5;

// Process-level layer: Redis is optional (`cacheGet` returns null without it).
const memoryCache = new Map<string, CommuneResolution>();

export function communeLookupKey(lookup: CommuneLookup): string {
  return `${lookup.postalCode ?? ""}|${lookup.city ? normalizeCommuneName(lookup.city) : ""}`;
}

async function fetchCandidates(
  lookup: CommuneLookup,
  fetchFn: typeof fetch,
  timeoutMs: number,
): Promise<CommuneCandidate[] | null> {
  const params = new URLSearchParams({ fields: "nom,code", limit: "5" });
  if (lookup.postalCode) params.set("codePostal", lookup.postalCode);
  if (lookup.city) params.set("nom", lookup.city);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(`${GEO_URL}?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return null;
    return data.filter(
      (c): c is CommuneCandidate =>
        !!c && typeof c.nom === "string" && typeof c.code === "string",
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveOne(lookup: CommuneLookup, deps: GeoDeps): Promise<CommuneResolution> {
  const key = communeLookupKey(lookup);
  const inMemory = memoryCache.get(key);
  if (inMemory) return inMemory;

  const redisKey = `geo:commune:${key}`;
  const inRedis = await cacheGet<CommuneResolution>(redisKey);
  if (inRedis) {
    memoryCache.set(key, inRedis);
    return inRedis;
  }

  const candidates = await fetchCandidates(
    lookup,
    deps.fetchFn ?? fetch,
    deps.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  // A failed lookup is not cached: the next import may succeed.
  if (candidates === null) return { status: "unavailable" };

  const resolution: CommuneResolution = pickCommune(candidates, lookup.city);
  memoryCache.set(key, resolution);
  await cacheSet(redisKey, resolution, CACHE_TTL_SECONDS);
  return resolution;
}

/** Resolves every distinct lookup once (bounded concurrency). Keys come from `communeLookupKey`. */
export async function resolveCommunes(
  lookups: CommuneLookup[],
  deps: GeoDeps = {},
): Promise<Map<string, CommuneResolution>> {
  const distinct = new Map<string, CommuneLookup>();
  for (const lookup of lookups) {
    if (!lookup.postalCode && !lookup.city) continue;
    distinct.set(communeLookupKey(lookup), lookup);
  }

  const results = new Map<string, CommuneResolution>();
  const queue = [...distinct.entries()];
  const workers = Array.from(
    { length: Math.min(deps.concurrency ?? DEFAULT_CONCURRENCY, queue.length) },
    async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const [key, lookup] = next;
        try {
          results.set(key, await resolveOne(lookup, deps));
        } catch {
          results.set(key, { status: "unavailable" });
        }
      }
    },
  );
  await Promise.all(workers);
  return results;
}

/** Test helper: the module-level cache would otherwise leak between tests. */
export function clearCommuneMemoryCache(): void {
  memoryCache.clear();
}

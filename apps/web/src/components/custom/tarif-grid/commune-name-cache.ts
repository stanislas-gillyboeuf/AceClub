// A small, best-effort code -> name cache for French communes (INSEE codes), so rule/condition
// summaries can read "Rennes" instead of "35238". Populated by tarif-rule-commune-picker.tsx as
// the admin picks communes; never fetched proactively here (offline-safe, no extra API calls).
const STORAGE_KEY = "aceclub:commune-name-cache"

function readCache(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getCommuneName(code: string): string | undefined {
  return readCache()[code]
}

export function rememberCommuneName(code: string, name: string) {
  if (typeof window === "undefined") return
  try {
    const cache = readCache()
    cache[code] = name
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // best-effort only — a full localStorage or a private window just means codes show instead of names
  }
}

export function describeCommuneCodes(codes: string[]): string {
  return codes.map((code) => getCommuneName(code) ?? code).join(", ")
}

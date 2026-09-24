/** Lowercased, accent-free, punctuation-free key used to compare headers, tags and free text. */
export function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/**
 * Excel serial date → "YYYY-MM-DD". Excel wrongly treats 1900 as a leap year, so serial 60 is the
 * non-existent 1900-02-29 (rejected) and serials below 60 are shifted by one day.
 */
export function excelSerialToIso(serial: number): string | null {
  if (!Number.isFinite(serial) || serial < 1 || serial > 60000) return null
  const whole = Math.floor(serial)
  if (whole === 60) return null
  const epoch = whole < 60 ? Date.UTC(1899, 11, 31) : Date.UTC(1899, 11, 30)
  const date = new Date(epoch + whole * 86_400_000)
  return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/**
 * Normalizes a birth date to "YYYY-MM-DD" (what the API and the pricing engine expect), or null
 * when it isn't a real date. Accepts DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD (day/month are
 * always read the French way) and 5-digit Excel serial numbers (1927-2064), which is what a date
 * column looks like once a spreadsheet has been exported without formatting.
 * Same rules as services/api/scripts/lib/parse-birth-date.ts.
 */
export function normalizeBirthDate(value: string): string | null {
  const trimmed = value.trim()
  const dayFirst = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  const yearFirst = trimmed.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/)

  if (dayFirst) {
    const [day, month, year] = [Number(dayFirst[1]), Number(dayFirst[2]), Number(dayFirst[3])]
    return isRealDate(year, month, day) ? toIso(year, month, day) : null
  }
  if (yearFirst) {
    const [year, month, day] = [Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3])]
    return isRealDate(year, month, day) ? toIso(year, month, day) : null
  }
  // A bare 4-digit number is a year, not a serial — only 5-digit serials are plausible birth dates.
  if (/^\d{5}$/.test(trimmed)) {
    const serial = Number(trimmed)
    if (serial >= 10000 && serial <= 60000) return excelSerialToIso(serial)
  }
  return null
}

/**
 * Parses a date typed by a French admin. The French DD/MM/YYYY form is tried FIRST: V8's
 * `new Date("01/02/2026")` happily parses it as US month/day (January 2nd), so trying it first
 * would silently swap day and month for every date whose day is 12 or less.
 */
export function parseFlexibleDate(value: string): Date | null {
  const iso = normalizeBirthDate(value)
  if (iso) return new Date(`${iso}T00:00:00.000Z`)

  const fallback = new Date(value)
  if (!Number.isNaN(fallback.getTime())) return fallback

  return null
}

const TRUE_VALUES = new Set(["oui", "o", "yes", "y", "1", "x", "vrai", "true"])
const FALSE_VALUES = new Set(["non", "n", "no", "0", "faux", "false"])

/** oui/non-style cell → boolean, or null when unreadable (the caller emits a warning). */
export function parseYesNo(value: string): boolean | null {
  const key = normalizeKey(value)
  if (TRUE_VALUES.has(key)) return true
  if (FALSE_VALUES.has(key)) return false
  return null
}

/** Splits a "statuts" cell on , ; | / and drops empties and case/accent-insensitive duplicates. */
export function splitTags(value: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []
  for (const part of value.split(/[,;|/]/)) {
    const tag = part.trim()
    if (!tag) continue
    const key = normalizeKey(tag)
    if (!key || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

import type { BulkImportRow } from "@/types/club-admin"

export type ClubMemberImportField =
  | "name"
  | "email"
  | "phone"
  | "licenseNumber"
  | "licenseValidUntil"
  | "dateOfBirth"
  | "ignore"

export interface MappedImportRow {
  row: BulkImportRow | null
  reason?: string
  /** Non-blocking issues: the row still imports, but the listed field was dropped. */
  warnings?: string[]
}

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/**
 * Normalizes a birth date to "YYYY-MM-DD" (what the API and the pricing engine expect), or null
 * when it isn't a real date. Accepts DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY and YYYY-MM-DD; day/month
 * are always read the French way. Same rules as services/api/scripts/lib/parse-birth-date.ts.
 */
export function normalizeBirthDate(value: string): string | null {
  const trimmed = value.trim()
  const dayFirst = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  const yearFirst = trimmed.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/)

  let year: number
  let month: number
  let day: number
  if (dayFirst) {
    ;[day, month, year] = [Number(dayFirst[1]), Number(dayFirst[2]), Number(dayFirst[3])]
  } else if (yearFirst) {
    ;[year, month, day] = [Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3])]
  } else {
    return null
  }

  if (!isRealDate(year, month, day)) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/**
 * Parses a date typed by a French admin. The French DD/MM/YYYY form is tried FIRST: V8's
 * `new Date("01/02/2026")` happily parses it as US month/day (January 2nd), so trying it first
 * would silently swap day and month for every date whose day is 12 or less.
 */
function parseFlexibleDate(value: string): Date | null {
  const iso = normalizeBirthDate(value)
  if (iso) return new Date(`${iso}T00:00:00.000Z`)

  const fallback = new Date(value)
  if (!Number.isNaN(fallback.getTime())) return fallback

  return null
}

/** Pure mapping/validation logic for the CSV import wizard — kept separate from the page so it's testable. */
export function mapClubMemberImportRows(
  rawRows: Record<string, string>[],
  mapping: Record<string, ClubMemberImportField>,
): MappedImportRow[] {
  const emailColumn = Object.entries(mapping).find(([, target]) => target === "email")?.[0]
  const nameColumn = Object.entries(mapping).find(([, target]) => target === "name")?.[0]
  const seenEmails = new Set<string>()

  return rawRows.map((rawRow) => {
    const isEmpty = Object.values(rawRow).every((value) => !value?.trim())
    if (isEmpty) return { row: null, reason: "Ligne vide" }

    const email = emailColumn ? rawRow[emailColumn]?.trim().toLowerCase() : ""
    const name = nameColumn ? rawRow[nameColumn]?.trim() : ""

    if (!email || !email.includes("@")) return { row: null, reason: "Email manquant ou invalide" }
    if (!name) return { row: null, reason: "Nom manquant" }
    if (seenEmails.has(email)) return { row: null, reason: "Email en double dans le fichier" }
    seenEmails.add(email)

    const row: BulkImportRow = { name, email }
    const warnings: string[] = []
    for (const [column, target] of Object.entries(mapping)) {
      const value = rawRow[column]?.trim()
      if (!value || target === "ignore" || target === "name" || target === "email") continue
      if (target === "licenseValidUntil") {
        const date = parseFlexibleDate(value)
        if (date) row.licenseValidUntil = date.toISOString()
      } else if (target === "dateOfBirth") {
        const iso = normalizeBirthDate(value)
        if (iso) row.dateOfBirth = iso
        else warnings.push(`Date de naissance illisible (« ${value} ») : non importée`)
      } else {
        row[target] = value
      }
    }

    return warnings.length > 0 ? { row, warnings } : { row }
  })
}

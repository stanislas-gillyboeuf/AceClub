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
}

/**
 * Parses a date typed by a French admin — accepts ISO (2026-12-31) and the
 * DD/MM/YYYY format people actually type, since `new Date("31/12/2026")`
 * silently returns an Invalid Date otherwise.
 */
function parseFlexibleDate(value: string): Date | null {
  const isoAttempt = new Date(value)
  if (!Number.isNaN(isoAttempt.getTime())) return isoAttempt

  const frenchMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frenchMatch) {
    const [, day, month, year] = frenchMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!Number.isNaN(date.getTime())) return date
  }

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
    for (const [column, target] of Object.entries(mapping)) {
      const value = rawRow[column]?.trim()
      if (!value || target === "ignore" || target === "name" || target === "email") continue
      if (target === "licenseValidUntil") {
        const date = parseFlexibleDate(value)
        if (date) row.licenseValidUntil = date.toISOString()
      } else {
        row[target] = value
      }
    }

    return { row }
  })
}

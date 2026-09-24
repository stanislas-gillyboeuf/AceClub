import type { BulkImportRow } from "@/types/club-admin"
import type { ImportField } from "./columns"
import type { RawImportRow } from "./decode"
import { normalizeBirthDate, normalizeKey, parseFlexibleDate, parseYesNo, splitTags } from "./normalize"

export interface MappedImportRow {
  /** 1-based row number in the uploaded file (header = 1), kept for the rejected-rows export. */
  sourceRow: number
  row: BulkImportRow | null
  reason?: string
  /** Non-blocking issues: the row still imports, but the listed field was dropped. */
  warnings?: string[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function columnsFor(mapping: Record<string, ImportField>, field: ImportField): string[] {
  return Object.entries(mapping)
    .filter(([, target]) => target === field)
    .map(([column]) => column)
}

function firstValue(cells: Record<string, string>, columns: string[]): string {
  for (const column of columns) {
    const value = cells[column]?.trim()
    if (value) return value
  }
  return ""
}

/** "12345" → "12345", Excel-stripped "1000" → "01000"; anything else is unreadable (null). */
export function normalizePostalCode(value: string): string | null {
  const digits = value.replace(/\s/g, "")
  if (/^\d{5}$/.test(digits)) return digits
  if (/^\d{4}$/.test(digits)) return `0${digits}`
  return null
}

/** Pure mapping/validation logic for the import wizard — kept separate from the page so it's testable. */
export function mapImportRows(
  rawRows: RawImportRow[],
  mapping: Record<string, ImportField>,
): MappedImportRow[] {
  const nameCols = columnsFor(mapping, "name")
  const firstNameCols = columnsFor(mapping, "firstName")
  const lastNameCols = columnsFor(mapping, "lastName")
  const seen = new Set<string>()

  return rawRows.map(({ sourceRow, cells }): MappedImportRow => {
    if (Object.values(cells).every((value) => !value?.trim())) {
      return { sourceRow, row: null, reason: "Ligne vide" }
    }

    const fullName = firstValue(cells, nameCols)
    const name =
      fullName ||
      [firstValue(cells, firstNameCols), firstValue(cells, lastNameCols)].filter(Boolean).join(" ")
    if (!name) return { sourceRow, row: null, reason: "Nom manquant" }

    const warnings: string[] = []

    const rawEmail = firstValue(cells, columnsFor(mapping, "email")).toLowerCase()
    if (rawEmail && !EMAIL_PATTERN.test(rawEmail)) {
      return { sourceRow, row: null, reason: `Email invalide (« ${rawEmail} »)` }
    }
    const email = rawEmail || undefined

    let dateOfBirth: string | undefined
    const rawBirth = firstValue(cells, columnsFor(mapping, "dateOfBirth"))
    if (rawBirth) {
      const iso = normalizeBirthDate(rawBirth)
      if (iso) dateOfBirth = iso
      else warnings.push(`Date de naissance illisible (« ${rawBirth} ») : non importée`)
    }

    if (!email && !dateOfBirth) {
      return {
        sourceRow,
        row: null,
        reason: "Email ou date de naissance requis pour identifier la personne",
      }
    }

    // Strict duplicate = the same person. The same email on rows with different identities is a
    // household (a parent's address shared by the children), resolved by the API — not a duplicate.
    const identity = `${email ?? ""}|${normalizeKey(name)}|${dateOfBirth ?? ""}`
    if (seen.has(identity)) {
      return { sourceRow, row: null, reason: "Doublon dans le fichier (même personne)" }
    }
    seen.add(identity)

    const row: BulkImportRow = { name }
    if (email) row.email = email
    if (dateOfBirth) row.dateOfBirth = dateOfBirth

    const phone = firstValue(cells, columnsFor(mapping, "phone"))
    if (phone) row.phone = phone

    const licenseNumber = firstValue(cells, columnsFor(mapping, "licenseNumber"))
    if (licenseNumber) row.licenseNumber = licenseNumber

    for (const [field, key, label] of [
      ["licenseValidUntil", "licenseValidUntil", "Fin de licence"],
      ["medicalCertificateValidUntil", "medicalCertificateValidUntil", "Fin de certificat médical"],
    ] as const) {
      const raw = firstValue(cells, columnsFor(mapping, field))
      if (!raw) continue
      const date = parseFlexibleDate(raw)
      if (date) row[key] = date.toISOString()
      else warnings.push(`${label} illisible (« ${raw} ») : non importée`)
    }

    const rawPostal = firstValue(cells, columnsFor(mapping, "postalCode"))
    if (rawPostal) {
      const postalCode = normalizePostalCode(rawPostal)
      if (postalCode) row.postalCode = postalCode
      else warnings.push(`Code postal illisible (« ${rawPostal} ») : non importé`)
    }

    const city = firstValue(cells, columnsFor(mapping, "city"))
    if (city) row.city = city

    const rawElsewhere = firstValue(cells, columnsFor(mapping, "licensedElsewhere"))
    if (rawElsewhere) {
      const elsewhere = parseYesNo(rawElsewhere)
      if (elsewhere === null) warnings.push(`« Licencié ailleurs » illisible (« ${rawElsewhere} ») : ignoré`)
      else row.licensedElsewhere = elsewhere
    }

    // The responsible person's email is the most precise household key; a "foyer" column is the fallback.
    const rawResponsible = firstValue(cells, columnsFor(mapping, "householdEmail")).toLowerCase()
    const rawHousehold = firstValue(cells, columnsFor(mapping, "household")).toLowerCase()
    if (rawResponsible) {
      if (EMAIL_PATTERN.test(rawResponsible)) row.householdKey = rawResponsible
      else if (!rawHousehold) warnings.push(`Email du responsable illisible (« ${rawResponsible} ») : foyer ignoré`)
    }
    if (!row.householdKey && rawHousehold) row.householdKey = rawHousehold

    const tags = splitTags(firstValue(cells, columnsFor(mapping, "tags")))
    if (tags.length > 0) row.tags = tags

    return warnings.length > 0 ? { sourceRow, row, warnings } : { sourceRow, row }
  })
}

/** Tag names used by the file that the club doesn't have yet (case/accent-insensitive), first spelling kept. */
export function findNewTags(rows: BulkImportRow[], existingTagNames: string[]): string[] {
  const known = new Set(existingTagNames.map(normalizeKey))
  const found = new Map<string, string>()
  for (const row of rows) {
    for (const tag of row.tags ?? []) {
      const key = normalizeKey(tag)
      if (key && !known.has(key) && !found.has(key)) found.set(key, tag)
    }
  }
  return [...found.values()]
}

/**
 * Splits rows into batches of at most `maxSize` WITHOUT cutting a household in two: rows sharing a
 * `householdKey` — a parent whose own email is another row's `householdKey`, and rows that simply
 * share the same email — travel together (a household bigger than `maxSize` gets a batch of its own). Households are placed in the order
 * of their first row, and a household's rows end up contiguous — so callers must track each sent
 * row's `sourceRow` per batch rather than assume file order.
 */
export function chunkByHousehold<T extends { row: BulkImportRow }>(items: T[], maxSize = 2000): T[][] {
  const referenced = new Set(items.map((item) => item.row.householdKey).filter((key): key is string => !!key))
  const emailCounts = new Map<string, number>()
  for (const { row } of items) {
    if (row.email) emailCounts.set(row.email, (emailCounts.get(row.email) ?? 0) + 1)
  }
  const groupOf = (item: T, index: number): string => {
    const { householdKey, email } = item.row
    if (householdKey) return `h:${householdKey}`
    // The same address on several rows is a household the API resolves: keep those rows together.
    if (email && (referenced.has(email) || (emailCounts.get(email) ?? 0) > 1)) return `h:${email}`
    return `s:${index}`
  }

  const groups = new Map<string, T[]>()
  items.forEach((item, index) => {
    const key = groupOf(item, index)
    const list = groups.get(key)
    if (list) list.push(item)
    else groups.set(key, [item])
  })

  const chunks: T[][] = []
  let current: T[] = []
  for (const group of groups.values()) {
    if (current.length > 0 && current.length + group.length > maxSize) {
      chunks.push(current)
      current = []
    }
    current.push(...group)
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

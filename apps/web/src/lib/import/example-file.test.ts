import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { autoMapColumns } from "./columns"
import { decodeCsvBuffer, parseCsvText } from "./decode"
import { chunkByHousehold, findNewTags, mapImportRows } from "./map-rows"

function loadExample(name: string) {
  const path = fileURLToPath(new URL(`../../../public/modeles/${name}`, import.meta.url))
  return readFileSync(path)
}

describe("exemple-import-30-membres.csv", () => {
  const { text, encoding } = decodeCsvBuffer(loadExample("exemple-import-30-membres.csv"))
  const table = parseCsvText(text)
  const mapping = autoMapColumns(table.headers)
  const mapped = mapImportRows(table.rows, mapping)

  it("is UTF-8 with accents intact and 30 data rows", () => {
    expect(encoding).toBe("utf-8")
    expect(table.rows).toHaveLength(30)
    expect(text).toContain("Élodie")
    expect(text).toContain("Gaëtan")
    expect(text).toContain("Noël")
    expect(text).toContain("François")
  })

  it("maps every column automatically", () => {
    expect(Object.values(mapping)).not.toContain("ignore")
  })

  it("rejects no valid row by mistake — only the warnings are expected", () => {
    expect(mapped.filter((m) => m.row === null)).toEqual([])
    const withWarnings = mapped.filter((m) => m.warnings?.length)
    expect(withWarnings.map((m) => m.row?.name)).toEqual(["Yannick Colin", "Chloé Dupuis"])
    expect(withWarnings[0].warnings?.[0]).toContain("Date de naissance illisible")
    expect(withWarnings[1].warnings?.[0]).toContain("Licencié ailleurs")
  })

  it("contains children without email that carry the parent's email as household key", () => {
    const noEmail = mapped.filter((m) => m.row && !m.row.email)
    expect(noEmail.length).toBeGreaterThanOrEqual(8)
    expect(noEmail.filter((m) => m.row?.householdKey).length).toBeGreaterThanOrEqual(7)
  })

  it("announces the statuses to create and never splits a household across batches", () => {
    const rows = mapped.map((m) => m.row!)
    expect(findNewTags(rows, []).sort()).toEqual(["Bureau", "Jeune", "Senior", "Étudiant"].sort())

    const items = mapped.map((m) => ({ row: m.row!, sourceRow: m.sourceRow }))
    const chunks = chunkByHousehold(items, 8)
    const chunkOfRow = new Map<number, number>()
    chunks.forEach((chunk, index) => chunk.forEach((item) => chunkOfRow.set(item.sourceRow, index)))
    const keys = new Set(items.map((i) => i.row.householdKey).filter(Boolean))
    for (const email of new Set(items.map((i) => i.row.email).filter(Boolean))) {
      if (items.filter((i) => i.row.email === email).length > 1) keys.add(email)
    }
    expect(keys.size).toBeGreaterThanOrEqual(6)
    for (const key of keys) {
      const members = items.filter((i) => i.row.householdKey === key || i.row.email === key)
      expect(new Set(members.map((i) => chunkOfRow.get(i.sourceRow))).size).toBe(1)
    }
  })
})

describe("modele-import-membres.csv", () => {
  it("only holds the headers and maps cleanly", () => {
    const table = parseCsvText(decodeCsvBuffer(loadExample("modele-import-membres.csv")).text)
    expect(table.rows).toHaveLength(0)
    expect(table.headers).toHaveLength(12)
    expect(Object.values(autoMapColumns(table.headers))).not.toContain("ignore")
  })
})

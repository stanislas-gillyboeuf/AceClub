import { describe, expect, it } from "vitest"
import { autoMapColumns } from "./columns"
import { parseCsvText, decodeCsvBuffer } from "./decode"
import { mapImportRows } from "./map-rows"
import { buildRejectsCsv, mergeApiSkips } from "./rejects"
import { buildTemplateCsv, TEMPLATE_HEADERS } from "./template"
import { fileKind, xlsxCellToString } from "./read-file"

describe("buildTemplateCsv", () => {
  it("is Excel-friendly: BOM, semicolons, CRLF", () => {
    const csv = buildTemplateCsv()
    expect(csv.startsWith("﻿")).toBe(true)
    expect(csv).toContain("\r\n")
    expect(csv.split("\r\n")[0]).toBe(`﻿${TEMPLATE_HEADERS.join(";")}`)
  })

  it("round-trips through the importer with no rejected example row", () => {
    const { text } = decodeCsvBuffer(Buffer.from(buildTemplateCsv(), "utf8"))
    const table = parseCsvText(text)
    expect(table.headers).toEqual([...TEMPLATE_HEADERS])
    expect(table.rows).toHaveLength(3)

    const mapped = mapImportRows(table.rows, autoMapColumns(table.headers))
    expect(mapped.every((m) => m.row !== null)).toBe(true)
    expect(mapped.every((m) => !m.warnings)).toBe(true)
    // The two children carry the parent's email as household key and have no email of their own.
    expect(mapped[1].row).toMatchObject({ name: "Léo Martin", householdKey: "claire.martin@example.com" })
    expect(mapped[1].row?.email).toBeUndefined()
  })
})

describe("mergeApiSkips / buildRejectsCsv", () => {
  it("maps batch indexes back to file rows", () => {
    expect(mergeApiSkips([2, 9, 14], [{ row: 1, reason: "Doublon" }])).toEqual([{ sourceRow: 9, reason: "Doublon" }])
  })

  it("exports the original columns plus a reason, sorted by file row", () => {
    const table = parseCsvText("Nom;Email\r\nA;a@example.com\r\nB;b@example.com\r\nC;c@example.com\r\n")
    const csv = buildRejectsCsv(table.headers, table.rows, [
      { sourceRow: 4, reason: "Email invalide" },
      { sourceRow: 2, reason: "Doublon; vraiment" },
    ])
    expect(csv.startsWith("﻿")).toBe(true)
    expect(csv.split("\r\n")).toEqual([
      "﻿Nom;Email;Motif",
      'A;a@example.com;"Doublon; vraiment"',
      "C;c@example.com;Email invalide",
      "",
    ])
  })
})

describe("read-file helpers", () => {
  it("detects the file kind from its extension", () => {
    expect(fileKind("membres.CSV")).toBe("csv")
    expect(fileKind("membres.xlsx")).toBe("xlsx")
    expect(fileKind("membres.xls")).toBe("xls")
    expect(fileKind("membres.pdf")).toBe("unknown")
  })

  it("converts xlsx cells to text, dates to ISO (UTC)", () => {
    expect(xlsxCellToString(null)).toBe("")
    expect(xlsxCellToString(undefined)).toBe("")
    expect(xlsxCellToString(35000)).toBe("35000")
    expect(xlsxCellToString(true)).toBe("oui")
    expect(xlsxCellToString(false)).toBe("non")
    expect(xlsxCellToString(new Date(Date.UTC(2014, 8, 5)))).toBe("2014-09-05")
    expect(xlsxCellToString(new Date(Number.NaN))).toBe("")
    expect(xlsxCellToString("Élodie")).toBe("Élodie")
  })
})

import { describe, expect, it } from "vitest"
import type { ImportField } from "./columns"
import type { RawImportRow } from "./decode"
import { chunkByHousehold, findNewTags, mapImportRows, normalizePostalCode } from "./map-rows"
import type { BulkImportRow } from "@/types/club-admin"

const MAPPING: Record<string, ImportField> = {
  Nom: "lastName",
  Prénom: "firstName",
  Email: "email",
  Naissance: "dateOfBirth",
  CP: "postalCode",
  Commune: "city",
  Ailleurs: "licensedElsewhere",
  Responsable: "householdEmail",
  Foyer: "household",
  Statuts: "tags",
  Licence: "licenseNumber",
  "Fin licence": "licenseValidUntil",
  Téléphone: "phone",
}

function raw(sourceRow: number, cells: Record<string, string>): RawImportRow {
  const full: Record<string, string> = Object.fromEntries(Object.keys(MAPPING).map((key) => [key, ""]))
  return { sourceRow, cells: { ...full, ...cells } }
}

describe("mapImportRows", () => {
  it("builds a full row and normalizes every field", () => {
    const [mapped] = mapImportRows(
      [
        raw(2, {
          Nom: "Dubois",
          Prénom: "Élodie",
          Email: " Elodie.Dubois@Example.com ",
          Naissance: "14/05/1982",
          CP: "35000",
          Commune: "Rennes",
          Ailleurs: "oui",
          Statuts: "Étudiant, Bureau",
          Licence: "2011234",
          "Fin licence": "30/09/2026",
          Téléphone: "06 11 22 33 44",
        }),
      ],
      MAPPING,
    )
    expect(mapped.sourceRow).toBe(2)
    expect(mapped.warnings).toBeUndefined()
    expect(mapped.row).toEqual({
      name: "Élodie Dubois",
      email: "elodie.dubois@example.com",
      dateOfBirth: "1982-05-14",
      postalCode: "35000",
      city: "Rennes",
      licensedElsewhere: true,
      tags: ["Étudiant", "Bureau"],
      licenseNumber: "2011234",
      licenseValidUntil: "2026-09-30T00:00:00.000Z",
      phone: "06 11 22 33 44",
    })
  })

  it("uses a full-name column when there is one", () => {
    const [mapped] = mapImportRows(
      [{ sourceRow: 2, cells: { Complet: "Anna Petit", Email: "anna@example.com" } }],
      { Complet: "name", Email: "email" },
    )
    expect(mapped.row?.name).toBe("Anna Petit")
  })

  it("rejects empty rows, missing names and invalid emails", () => {
    const rows = mapImportRows(
      [
        raw(2, {}),
        raw(3, { Email: "a@example.com" }),
        raw(4, { Nom: "Martin", Email: "pas-un-email" }),
      ],
      MAPPING,
    )
    expect(rows.map((r) => r.reason)).toEqual(["Ligne vide", "Nom manquant", "Email invalide (« pas-un-email »)"])
    expect(rows.every((r) => r.row === null)).toBe(true)
  })

  it("keeps a child without email when a birth date identifies them", () => {
    const [mapped] = mapImportRows(
      [raw(5, { Nom: "Dubois", Prénom: "Hélène", Naissance: "22/02/2012", Responsable: "Elodie.Dubois@example.com" })],
      MAPPING,
    )
    expect(mapped.row).toEqual({
      name: "Hélène Dubois",
      dateOfBirth: "2012-02-22",
      householdKey: "elodie.dubois@example.com",
    })
  })

  it("rejects a row with neither email nor a readable birth date, keeping its source row", () => {
    const rows = mapImportRows(
      [raw(6, { Nom: "Girard", Prénom: "Léa" }), raw(7, { Nom: "Girard", Prénom: "Théo", Naissance: "31/02/2016" })],
      MAPPING,
    )
    expect(rows.map((r) => [r.sourceRow, r.reason])).toEqual([
      [6, "Email ou date de naissance requis pour identifier la personne"],
      [7, "Email ou date de naissance requis pour identifier la personne"],
    ])
  })

  it("does not treat the same email on different people as a duplicate (household)", () => {
    const rows = mapImportRows(
      [
        raw(2, { Nom: "Moreau", Prénom: "Sandrine", Email: "sandrine.moreau@example.com", Naissance: "28/09/1985" }),
        raw(3, { Nom: "Moreau", Prénom: "Lucas", Email: "sandrine.moreau@example.com", Naissance: "17/06/2011" }),
        raw(4, { Nom: "Moreau", Prénom: "Inès", Email: "sandrine.moreau@example.com", Naissance: "30/03/2014" }),
      ],
      MAPPING,
    )
    expect(rows.every((r) => r.row !== null)).toBe(true)
  })

  it("rejects a strict duplicate (same email, name and birth date)", () => {
    const rows = mapImportRows(
      [
        raw(2, { Nom: "Blanc", Prénom: "Mélissa", Email: "melissa@example.com", Naissance: "27/11/1988" }),
        raw(3, { Nom: "BLANC", Prénom: "melissa", Email: "Melissa@example.com", Naissance: "1988-11-27" }),
      ],
      MAPPING,
    )
    expect(rows[0].row).not.toBeNull()
    expect(rows[1]).toMatchObject({ sourceRow: 3, row: null, reason: "Doublon dans le fichier (même personne)" })
  })

  it("rejects the same person twice when neither has an email", () => {
    const rows = mapImportRows(
      [
        raw(2, { Nom: "Garnier", Prénom: "Zoé", Naissance: "30/06/2007" }),
        raw(3, { Nom: "Garnier", Prénom: "Zoé", Naissance: "2007-06-30" }),
      ],
      MAPPING,
    )
    expect(rows[1].row).toBeNull()
  })

  it("imports with warnings when optional fields are unreadable", () => {
    const [mapped] = mapImportRows(
      [
        raw(2, {
          Nom: "Colin",
          Prénom: "Yannick",
          Email: "yannick@example.com",
          Naissance: "31/02/1990",
          Ailleurs: "peut-être",
          CP: "abc",
          "Fin licence": "n'importe quoi",
          Responsable: "pas-un-email",
        }),
      ],
      MAPPING,
    )
    expect(mapped.row).toEqual({ name: "Yannick Colin", email: "yannick@example.com" })
    expect(mapped.warnings).toHaveLength(5)
    expect(mapped.warnings?.join(" | ")).toContain("Date de naissance illisible")
    expect(mapped.warnings?.join(" | ")).toContain("Licencié ailleurs")
    expect(mapped.warnings?.join(" | ")).toContain("Code postal illisible")
    expect(mapped.warnings?.join(" | ")).toContain("Fin de licence illisible")
    expect(mapped.warnings?.join(" | ")).toContain("Email du responsable illisible")
  })

  it("prefers the responsible email over the household column as household key", () => {
    const [both, onlyHousehold] = mapImportRows(
      [
        raw(2, { Nom: "A", Prénom: "A", Naissance: "01/01/2010", Responsable: "Parent@Example.com", Foyer: "Famille A" }),
        raw(3, { Nom: "B", Prénom: "B", Naissance: "01/01/2011", Foyer: " Famille A " }),
      ],
      MAPPING,
    )
    expect(both.row?.householdKey).toBe("parent@example.com")
    expect(onlyHousehold.row?.householdKey).toBe("famille a")
  })
})

describe("normalizePostalCode", () => {
  it("restores a leading zero eaten by a spreadsheet", () => {
    expect(normalizePostalCode("1000")).toBe("01000")
    expect(normalizePostalCode("35 000")).toBe("35000")
    expect(normalizePostalCode("3500")).toBe("03500")
    expect(normalizePostalCode("350")).toBeNull()
    expect(normalizePostalCode("ABCDE")).toBeNull()
  })
})

describe("findNewTags", () => {
  it("lists tags the club lacks, ignoring case and accents, keeping the first spelling", () => {
    const rows: BulkImportRow[] = [
      { name: "A", tags: ["Étudiant", "Bureau"] },
      { name: "B", tags: ["etudiant", "Senior", "SENIOR"] },
      { name: "C" },
    ]
    expect(findNewTags(rows, ["étudiant"])).toEqual(["Bureau", "Senior"])
    expect(findNewTags(rows, [])).toEqual(["Étudiant", "Bureau", "Senior"])
  })
})

describe("chunkByHousehold", () => {
  const item = (name: string, extra: Partial<BulkImportRow> = {}) => ({ row: { name, ...extra } as BulkImportRow })

  it("keeps a household — and the parent whose email is the key — in the same batch", () => {
    const items = [
      item("Parent", { email: "p@example.com" }),
      item("Solo 1", { email: "s1@example.com" }),
      item("Enfant 1", { householdKey: "p@example.com" }),
      item("Solo 2", { email: "s2@example.com" }),
      item("Enfant 2", { householdKey: "p@example.com" }),
    ]
    const chunks = chunkByHousehold(items, 3)
    expect(chunks.map((chunk) => chunk.map((i) => i.row.name))).toEqual([
      ["Parent", "Enfant 1", "Enfant 2"],
      ["Solo 1", "Solo 2"],
    ])
  })

  it("never splits a household even when it is bigger than the batch size", () => {
    const items = [
      item("Solo", { email: "s@example.com" }),
      item("F1", { householdKey: "f" }),
      item("F2", { householdKey: "f" }),
      item("F3", { householdKey: "f" }),
    ]
    const chunks = chunkByHousehold(items, 2)
    expect(chunks.map((chunk) => chunk.map((i) => i.row.name))).toEqual([["Solo"], ["F1", "F2", "F3"]])
  })

  it("packs many single rows up to the batch size and handles empty input", () => {
    const items = Array.from({ length: 5 }, (_, i) => item(`P${i}`, { email: `p${i}@example.com` }))
    expect(chunkByHousehold(items, 2).map((chunk) => chunk.length)).toEqual([2, 2, 1])
    expect(chunkByHousehold([], 2)).toEqual([])
  })

  it("rows sharing the same email travel together even without a household key", () => {
    const items = [
      item("Solo", { email: "s@e.com" }),
      item("Parent", { email: "x@e.com" }),
      item("Enfant", { email: "x@e.com" }),
    ]
    const chunks = chunkByHousehold(items, 2)
    expect(chunks.map((chunk) => chunk.map((i) => i.row.name))).toEqual([["Solo"], ["Parent", "Enfant"]])
  })
})

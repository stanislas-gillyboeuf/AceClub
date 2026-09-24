import { describe, expect, it } from "vitest"
import { decodeCsvBuffer, detectDelimiter, parseCsvText, tableFromMatrix, uniqueHeaders } from "./decode"

describe("decodeCsvBuffer", () => {
  it("decodes UTF-8 and strips the BOM", () => {
    const bytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("Prénom;Élodie", "utf8")])
    expect(decodeCsvBuffer(bytes)).toEqual({ text: "Prénom;Élodie", encoding: "utf-8" })
  })

  it("decodes plain UTF-8 without BOM", () => {
    expect(decodeCsvBuffer(Buffer.from("Gaëtan", "utf8"))).toEqual({ text: "Gaëtan", encoding: "utf-8" })
  })

  it("falls back to windows-1252 when the bytes are not valid UTF-8", () => {
    // "Élodie Hélène" as Excel FR writes it: É = 0xC9, é = 0xE9, è = 0xE8
    const bytes = Buffer.from([0xc9, 0x6c, 0x6f, 0x64, 0x69, 0x65, 0x20, 0x48, 0xe9, 0x6c, 0xe8, 0x6e, 0x65])
    expect(decodeCsvBuffer(bytes)).toEqual({ text: "Élodie Hélène", encoding: "windows-1252" })
  })

  it("accepts an ArrayBuffer", () => {
    const bytes = new Uint8Array([0x4e, 0x6f, 0xeb, 0x6c])
    expect(decodeCsvBuffer(bytes.buffer).text).toBe("Noël")
  })
})

describe("detectDelimiter", () => {
  it("detects ; , and tab", () => {
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";")
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",")
    expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("\t")
  })

  it("ignores separators inside quotes", () => {
    expect(detectDelimiter('"Nom, Prénom";Email;Ville')).toBe(";")
    expect(detectDelimiter('"a;b;c",d,e')).toBe(",")
  })

  it("uses the first non-empty line and defaults to a comma", () => {
    expect(detectDelimiter("\n\nnom;email\n")).toBe(";")
    expect(detectDelimiter("nom")).toBe(",")
  })
})

describe("parseCsvText", () => {
  it("parses a semicolon file with quoted separators and keeps source row numbers", () => {
    const table = parseCsvText('Nom;Ville\r\n"Dupont; Jr";Rennes\r\n\r\nMartin;Nantes\r\n')
    expect(table.headers).toEqual(["Nom", "Ville"])
    expect(table.rows).toEqual([
      { sourceRow: 2, cells: { Nom: "Dupont; Jr", Ville: "Rennes" } },
      { sourceRow: 4, cells: { Nom: "Martin", Ville: "Nantes" } },
    ])
  })

  it("parses a comma file", () => {
    const table = parseCsvText("nom,email\nAnna,anna@example.com\n")
    expect(table.rows[0].cells).toEqual({ nom: "Anna", email: "anna@example.com" })
  })

  it("returns an empty table for an empty file", () => {
    expect(parseCsvText("")).toEqual({ headers: [], rows: [] })
  })
})

describe("uniqueHeaders / tableFromMatrix", () => {
  it("makes duplicate and empty headers unique", () => {
    expect(uniqueHeaders(["Nom", "Nom", "", " Email "])).toEqual(["Nom", "Nom (2)", "Colonne 3", "Email"])
  })

  it("skips leading blank rows and pads short rows", () => {
    const table = tableFromMatrix([[""], ["a", "b"], ["1"]])
    expect(table.headers).toEqual(["a", "b"])
    expect(table.rows).toEqual([{ sourceRow: 3, cells: { a: "1", b: "" } }])
  })
})

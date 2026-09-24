import { describe, expect, it } from "vitest"
import { excelSerialToIso, normalizeBirthDate, normalizeKey, parseFlexibleDate, parseYesNo, splitTags } from "./normalize"

describe("normalizeKey", () => {
  it("drops accents, case and punctuation", () => {
    expect(normalizeKey("  Licencié À l'Étranger ! ")).toBe("licencie a l etranger")
    expect(normalizeKey("N° de licence")).toBe("n de licence")
  })
})

describe("normalizeBirthDate", () => {
  it("reads French day/month first", () => {
    expect(normalizeBirthDate("31/12/2010")).toBe("2010-12-31")
    expect(normalizeBirthDate("01/02/2026")).toBe("2026-02-01")
    expect(normalizeBirthDate("5-9-2014")).toBe("2014-09-05")
    expect(normalizeBirthDate("05.09.2014")).toBe("2014-09-05")
  })

  it("accepts ISO dates", () => {
    expect(normalizeBirthDate("2010-12-31")).toBe("2010-12-31")
    expect(normalizeBirthDate("2007/6/3")).toBe("2007-06-03")
  })

  it("rejects dates that do not exist", () => {
    expect(normalizeBirthDate("31/02/1990")).toBeNull()
    expect(normalizeBirthDate("2010-13-01")).toBeNull()
    expect(normalizeBirthDate("29/02/2015")).toBeNull()
    expect(normalizeBirthDate("29/02/2016")).toBe("2016-02-29")
  })

  it("rejects free text and bare years", () => {
    expect(normalizeBirthDate("")).toBeNull()
    expect(normalizeBirthDate("hier")).toBeNull()
    expect(normalizeBirthDate("2010")).toBeNull()
  })

  it("converts plausible Excel serial numbers", () => {
    expect(normalizeBirthDate("40179")).toBe("2010-01-01")
  })
})

describe("excelSerialToIso", () => {
  it("converts serials after the fake 1900 leap day", () => {
    expect(excelSerialToIso(61)).toBe("1900-03-01")
    expect(excelSerialToIso(40179)).toBe("2010-01-01")
    expect(excelSerialToIso(45000)).toBe("2023-03-15")
  })

  it("handles serials before the fake 1900-02-29", () => {
    expect(excelSerialToIso(1)).toBe("1900-01-01")
    expect(excelSerialToIso(59)).toBe("1900-02-28")
  })

  it("rejects the non-existent 1900-02-29 and out-of-range values", () => {
    expect(excelSerialToIso(60)).toBeNull()
    expect(excelSerialToIso(0)).toBeNull()
    expect(excelSerialToIso(-5)).toBeNull()
    expect(excelSerialToIso(999999)).toBeNull()
    expect(excelSerialToIso(Number.NaN)).toBeNull()
  })
})

describe("parseFlexibleDate", () => {
  it("tries the French format before the US one", () => {
    expect(parseFlexibleDate("01/02/2026")?.toISOString()).toBe("2026-02-01T00:00:00.000Z")
  })

  it("falls back to native parsing and returns null for garbage", () => {
    expect(parseFlexibleDate("2026-09-30T10:00:00.000Z")?.toISOString()).toBe("2026-09-30T10:00:00.000Z")
    expect(parseFlexibleDate("n'importe quoi")).toBeNull()
  })
})

describe("parseYesNo", () => {
  it.each(["oui", "Oui", "O", "yes", "Y", "1", "x", "X", "vrai", "TRUE"])("reads %s as yes", (value) => {
    expect(parseYesNo(value)).toBe(true)
  })

  it.each(["non", "Non", "n", "no", "0", "faux", "FALSE"])("reads %s as no", (value) => {
    expect(parseYesNo(value)).toBe(false)
  })

  it("returns null for anything else", () => {
    expect(parseYesNo("peut-être")).toBeNull()
    expect(parseYesNo("")).toBeNull()
  })
})

describe("splitTags", () => {
  it("splits on , ; | /", () => {
    expect(splitTags("Étudiant, Bureau; Senior | Jeune / Coach")).toEqual([
      "Étudiant",
      "Bureau",
      "Senior",
      "Jeune",
      "Coach",
    ])
  })

  it("drops empties and accent/case-insensitive duplicates, keeping the first spelling", () => {
    expect(splitTags("Étudiant,, etudiant , ETUDIANT")).toEqual(["Étudiant"])
    expect(splitTags("")).toEqual([])
  })
})

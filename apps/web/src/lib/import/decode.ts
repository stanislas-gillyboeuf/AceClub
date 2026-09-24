import Papa from "papaparse"

/** One data row of the uploaded file. `sourceRow` is its 1-based row number in the file (header = 1). */
export interface RawImportRow {
  sourceRow: number
  cells: Record<string, string>
}

export interface ParsedTable {
  headers: string[]
  rows: RawImportRow[]
}

export type CsvEncoding = "utf-8" | "windows-1252"

/**
 * Decodes CSV bytes: strict UTF-8 first (a BOM is dropped), then windows-1252 — what Excel FR
 * writes for "CSV (séparateur : point-virgule)". Strict mode throws on an invalid UTF-8 sequence,
 * which is exactly the signal that the file is not UTF-8.
 */
export function decodeCsvBuffer(buffer: ArrayBuffer | Uint8Array): { text: string; encoding: CsvEncoding } {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    return { text: text.replace(/^﻿/, ""), encoding: "utf-8" }
  } catch {
    return { text: new TextDecoder("windows-1252").decode(bytes).replace(/^﻿/, ""), encoding: "windows-1252" }
  }
}

/** Picks `;`, `,` or a tab from the first non-empty line, ignoring separators inside quotes. */
export function detectDelimiter(text: string): ";" | "," | "\t" {
  const firstLine = text.split(/\r\n|\n|\r/).find((line) => line.trim().length > 0) ?? ""
  const counts: Record<";" | "," | "\t", number> = { ";": 0, ",": 0, "\t": 0 }
  let inQuotes = false
  for (const char of firstLine) {
    if (char === '"') inQuotes = !inQuotes
    else if (!inQuotes && char in counts) counts[char as ";" | "," | "\t"]++
  }
  if (counts[";"] >= counts[","] && counts[";"] >= counts["\t"] && counts[";"] > 0) return ";"
  if (counts["\t"] > counts[","]) return "\t"
  return ","
}

/** Makes header names unique and non-empty so every column can be addressed by its name. */
export function uniqueHeaders(rawHeaders: string[]): string[] {
  const seen = new Map<string, number>()
  return rawHeaders.map((raw, index) => {
    const base = raw.trim() || `Colonne ${index + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base} (${count})`
  })
}

/** Builds a table from a matrix of cells (first non-empty row = headers). Shared by CSV and xlsx. */
export function tableFromMatrix(matrix: string[][]): ParsedTable {
  const headerIndex = matrix.findIndex((row) => row.some((cell) => cell.trim().length > 0))
  if (headerIndex === -1) return { headers: [], rows: [] }

  const headers = uniqueHeaders(matrix[headerIndex])
  const rows: RawImportRow[] = []
  for (let i = headerIndex + 1; i < matrix.length; i++) {
    const values = matrix[i]
    if (values.every((cell) => cell.trim().length === 0)) continue
    const cells: Record<string, string> = {}
    headers.forEach((header, col) => {
      cells[header] = (values[col] ?? "").trim()
    })
    rows.push({ sourceRow: i + 1, cells })
  }
  return { headers, rows }
}

export function parseCsvText(text: string): ParsedTable {
  const delimiter = detectDelimiter(text)
  const parsed = Papa.parse<string[]>(text, { delimiter, skipEmptyLines: false })
  return tableFromMatrix(parsed.data.map((row) => row.map((cell) => String(cell ?? ""))))
}

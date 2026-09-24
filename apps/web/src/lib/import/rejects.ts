import Papa from "papaparse"
import type { RawImportRow } from "./decode"

export interface RejectedRow {
  /** 1-based row number in the uploaded file (header = 1). */
  sourceRow: number
  reason: string
}

/**
 * API rejections come back as `skipped[{ row, reason }]` where `row` is the index inside the batch
 * that was sent. `batchSourceRows[i]` is the file row of the i-th row of that batch.
 */
export function mergeApiSkips(
  batchSourceRows: number[],
  skipped: { row: number; reason: string }[],
): RejectedRow[] {
  return skipped.map(({ row, reason }) => ({ sourceRow: batchSourceRows[row] ?? row, reason }))
}

/** CSV of the rejected rows: the original columns + a "Motif" column, ready to fix and re-import. */
export function buildRejectsCsv(headers: string[], rawRows: RawImportRow[], rejects: RejectedRow[]): string {
  const bySource = new Map(rawRows.map((raw) => [raw.sourceRow, raw]))
  const lines: string[][] = [[...headers, "Motif"]]
  for (const { sourceRow, reason } of [...rejects].sort((a, b) => a.sourceRow - b.sourceRow)) {
    const raw = bySource.get(sourceRow)
    lines.push([...headers.map((header) => raw?.cells[header] ?? ""), reason])
  }
  return `﻿${Papa.unparse(lines, { delimiter: ";", newline: "\r\n" })}\r\n`
}

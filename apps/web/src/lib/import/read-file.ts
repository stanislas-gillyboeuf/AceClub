import { decodeCsvBuffer, parseCsvText, tableFromMatrix, type ParsedTable } from "./decode"

type XlsxCell = string | number | boolean | Date | null | undefined

/** xlsx cell → text. Date cells come back as UTC-based Dates, hence the UTC getters. */
export function xlsxCellToString(cell: XlsxCell): string {
  if (cell === null || cell === undefined) return ""
  if (cell instanceof Date) {
    if (Number.isNaN(cell.getTime())) return ""
    const month = String(cell.getUTCMonth() + 1).padStart(2, "0")
    const day = String(cell.getUTCDate()).padStart(2, "0")
    return `${cell.getUTCFullYear()}-${month}-${day}`
  }
  if (typeof cell === "boolean") return cell ? "oui" : "non"
  return String(cell)
}

export function fileKind(fileName: string): "csv" | "xlsx" | "xls" | "unknown" {
  const extension = fileName.toLowerCase().split(".").pop() ?? ""
  if (["csv", "txt", "tsv"].includes(extension)) return "csv"
  if (extension === "xlsx") return "xlsx"
  if (extension === "xls") return "xls"
  return "unknown"
}

/** Reads an uploaded .csv (UTF-8 or windows-1252, `;` `,` or tab) or .xlsx (first sheet) into a table. */
export async function readImportFile(file: File): Promise<ParsedTable> {
  const kind = fileKind(file.name)

  if (kind === "xls") {
    throw new Error("Le format .xls n'est pas pris en charge : enregistrez le fichier en .xlsx ou .csv.")
  }
  if (kind === "unknown") {
    throw new Error("Format non pris en charge : choisissez un fichier .csv ou .xlsx.")
  }

  if (kind === "csv") {
    const { text } = decodeCsvBuffer(await file.arrayBuffer())
    return parseCsvText(text)
  }

  // Loaded on demand: the xlsx reader is only needed when a spreadsheet is picked.
  const { readSheet } = await import("read-excel-file/browser")
  const data = (await readSheet(file)) as XlsxCell[][]
  return tableFromMatrix(data.map((row) => row.map(xlsxCellToString)))
}

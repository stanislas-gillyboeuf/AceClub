import Papa from "papaparse"

export const TEMPLATE_HEADERS = [
  "Nom",
  "Prénom",
  "Email",
  "Téléphone",
  "Date de naissance",
  "Code postal",
  "Commune",
  "N° de licence",
  "Licence valide jusqu'au",
  "Licencié ailleurs",
  "Email du responsable",
  "Statuts",
] as const

const TEMPLATE_EXAMPLES: string[][] = [
  ["Martin", "Claire", "claire.martin@example.com", "06 12 34 56 78", "12/03/1984", "35000", "Rennes", "1234567", "30/09/2026", "non", "", "Bureau"],
  ["Martin", "Léo", "", "", "05/09/2014", "35000", "Rennes", "", "", "non", "claire.martin@example.com", ""],
  ["Martin", "Zoé", "", "", "21/01/2017", "35000", "Rennes", "", "", "non", "claire.martin@example.com", ""],
]

/** Excel-friendly CSV: UTF-8 with BOM, `;` separator, CRLF line endings. */
export function buildTemplateCsv(): string {
  const csv = Papa.unparse([[...TEMPLATE_HEADERS], ...TEMPLATE_EXAMPLES], { delimiter: ";", newline: "\r\n" })
  return `﻿${csv}\r\n`
}

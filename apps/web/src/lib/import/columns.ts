import { normalizeKey } from "./normalize"

export type ImportField =
  | "name"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "postalCode"
  | "city"
  | "licenseNumber"
  | "licenseValidUntil"
  | "medicalCertificateValidUntil"
  | "licensedElsewhere"
  | "householdEmail"
  | "household"
  | "tags"
  | "ignore"

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  name: "Nom complet",
  firstName: "Prénom",
  lastName: "Nom de famille",
  email: "Email",
  phone: "Téléphone",
  dateOfBirth: "Date de naissance",
  postalCode: "Code postal",
  city: "Commune",
  licenseNumber: "Numéro de licence",
  licenseValidUntil: "Licence valide jusqu'au",
  medicalCertificateValidUntil: "Certificat médical valide jusqu'au",
  licensedElsewhere: "Licencié dans un autre club",
  householdEmail: "Email du responsable (foyer)",
  household: "Foyer / famille",
  tags: "Statuts",
  ignore: "Ignorer cette colonne",
}

// Synonyms are stored already normalized (see normalizeKey): lowercase, no accents, no punctuation.
const SYNONYMS: Record<Exclude<ImportField, "ignore">, string[]> = {
  name: ["nom complet", "nom prenom", "prenom nom", "nom et prenom", "full name", "name", "adherent", "membre", "joueur"],
  firstName: ["prenom", "first name", "firstname", "given name"],
  lastName: ["nom", "nom de famille", "last name", "lastname", "surname", "family name", "patronyme"],
  email: ["email", "e mail", "mail", "courriel", "adresse mail", "adresse email", "adresse e mail"],
  phone: ["telephone", "tel", "portable", "mobile", "gsm", "phone", "numero de telephone", "tel portable"],
  dateOfBirth: ["date de naissance", "date naissance", "date naiss", "ddn", "ne le", "nee le", "ne e le", "naissance", "dob", "birth date", "birthday"],
  postalCode: ["code postal", "cp", "zip", "zip code", "postal code"],
  city: ["commune", "ville", "city", "commune de residence", "ville de residence"],
  licenseNumber: ["licence", "n licence", "no licence", "num licence", "numero licence", "numero de licence", "n de licence", "license number"],
  licenseValidUntil: ["licence valide jusqu au", "licence valide", "fin de licence", "fin licence", "date fin licence", "validite licence", "validite de la licence", "expiration licence"],
  medicalCertificateValidUntil: ["certificat medical valide jusqu au", "certificat medical", "certif medical", "validite certificat medical", "fin certificat medical", "cm"],
  licensedElsewhere: ["licencie ailleurs", "licence ailleurs", "licencie dans un autre club", "licencie autre club", "autre club", "club exterieur"],
  householdEmail: ["email du responsable", "email responsable", "e mail responsable", "mail responsable", "email parent", "email du parent", "e mail parent", "e mail du parent", "mail parent", "mail du parent", "courriel parent", "responsable legal", "responsable", "parent", "tuteur", "contact"],
  household: ["foyer", "famille", "household"],
  tags: ["statuts", "statut", "tags", "tag", "categorie membre", "categorie", "profil"],
}

const EXACT = new Map<string, Exclude<ImportField, "ignore">>()
const CONTAINS: { key: string; field: Exclude<ImportField, "ignore"> }[] = []
for (const [field, list] of Object.entries(SYNONYMS) as [Exclude<ImportField, "ignore">, string[]][]) {
  for (const synonym of list) {
    if (!EXACT.has(synonym)) EXACT.set(synonym, field)
    // Short synonyms ("cp", "tel", "nom", "contact"…) only match a header exactly, never as part of a longer one.
    if (synonym.length >= 8) CONTAINS.push({ key: synonym, field })
  }
}
CONTAINS.sort((a, b) => b.key.length - a.key.length)

function guessField(header: string): Exclude<ImportField, "ignore"> | null {
  const key = normalizeKey(header)
  if (!key) return null
  const exact = EXACT.get(key)
  if (exact) return exact
  const padded = ` ${key} `
  return CONTAINS.find((entry) => padded.includes(` ${entry.key} `))?.field ?? null
}

/**
 * Pre-fills the column mapping from header names. Each field is claimed by the first matching
 * column only; later duplicates fall back to "ignore" so the admin can correct them by hand.
 */
export function autoMapColumns(headers: string[]): Record<string, ImportField> {
  const mapping: Record<string, ImportField> = {}
  const claimed = new Set<ImportField>()
  for (const header of headers) {
    const field = guessField(header)
    if (field && !claimed.has(field)) {
      mapping[header] = field
      claimed.add(field)
    } else {
      mapping[header] = "ignore"
    }
  }
  return mapping
}

/** True when the mapping is enough to identify people: a name (or first+last) and email or birth date. */
export function isMappingUsable(mapping: Record<string, ImportField>): boolean {
  const fields = new Set(Object.values(mapping))
  const hasName = fields.has("name") || fields.has("lastName") || fields.has("firstName")
  const hasIdentifier = fields.has("email") || fields.has("dateOfBirth")
  return hasName && hasIdentifier
}

export interface ImportProfileRow {
  licenseNumber?: string;
  licenseValidUntil?: string;
  medicalCertificateValidUntil?: string;
  phone?: string;
  dateOfBirth?: string;
  licensedElsewhere?: boolean;
  /** Resolved INSEE code + name (never the raw postal code / city typed in the file). */
  communeInsee?: string;
  communeName?: string;
}

export interface ImportProfileValues {
  licenseNumber?: string;
  licenseValidUntil?: Date;
  medicalCertificateValidUntil?: Date;
  phoneOverride?: string;
  dateOfBirth?: string;
  licensedElsewhere?: boolean;
  communeInsee?: string;
  communeName?: string;
}

/**
 * The profile columns a CSV row actually provides. Used as the `set` of the upsert, so a
 * re-import that omits a column never overwrites an existing value with null.
 * Empty strings count as "not provided", like a blank CSV cell; a boolean counts as provided
 * even when false ("licensed elsewhere: no" is an answer, not an absence).
 */
export function buildImportProfileValues(row: ImportProfileRow): ImportProfileValues {
  const values: ImportProfileValues = {};
  if (row.licenseNumber) values.licenseNumber = row.licenseNumber;
  if (row.licenseValidUntil) values.licenseValidUntil = new Date(row.licenseValidUntil);
  if (row.medicalCertificateValidUntil) {
    values.medicalCertificateValidUntil = new Date(row.medicalCertificateValidUntil);
  }
  if (row.phone) values.phoneOverride = row.phone;
  if (row.dateOfBirth) values.dateOfBirth = row.dateOfBirth;
  if (row.licensedElsewhere !== undefined) values.licensedElsewhere = row.licensedElsewhere;
  if (row.communeInsee && row.communeName) {
    values.communeInsee = row.communeInsee;
    values.communeName = row.communeName;
  }
  return values;
}

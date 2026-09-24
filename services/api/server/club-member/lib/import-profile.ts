export interface ImportProfileRow {
  licenseNumber?: string;
  licenseValidUntil?: string;
  phone?: string;
}

export interface ImportProfileValues {
  licenseNumber?: string;
  licenseValidUntil?: Date;
  phoneOverride?: string;
}

/**
 * The profile columns a CSV row actually provides. Used as the `set` of the upsert, so a
 * re-import that omits the license or phone never overwrites an existing value with null.
 * Empty strings count as "not provided", like a blank CSV cell.
 */
export function buildImportProfileValues(row: ImportProfileRow): ImportProfileValues {
  const values: ImportProfileValues = {};
  if (row.licenseNumber) values.licenseNumber = row.licenseNumber;
  if (row.licenseValidUntil) values.licenseValidUntil = new Date(row.licenseValidUntil);
  if (row.phone) values.phoneOverride = row.phone;
  return values;
}

/**
 * True only for a REAL calendar date written as "YYYY-MM-DD" (so "2010-02-30" and "31/12/2010"
 * are both rejected). Pure — uses UTC round-tripping, never the machine's timezone.
 */
export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

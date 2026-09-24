import { isValidIsoDate } from "../../server/pricing/lib/engine";

/**
 * Converts a birth date typed by a French admin into "YYYY-MM-DD", or null when it can't be
 * read as a real date. Day/month order is always French (DD/MM), never US: "01/02/2010" is
 * 1 February. Accepts DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY and YYYY/MM/DD (or - / .).
 * Pure — no I/O, safe to import from tests.
 */
export function parseBirthDate(input: string): string | null {
  const value = input.trim();

  const dayFirst = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(value);
  const yearFirst = /^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/.exec(value);

  let year: string;
  let month: string;
  let day: string;
  if (dayFirst) {
    [, day, month, year] = dayFirst;
  } else if (yearFirst) {
    [, year, month, day] = yearFirst;
  } else {
    return null;
  }

  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  return isValidIsoDate(iso) ? iso : null;
}

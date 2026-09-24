export function defaultSeasonDates() {
  // If we're already past September 1st, default to the season starting THIS year;
  // otherwise the season that started last year is still the current/upcoming one.
  const now = new Date()
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  return {
    start: `${year}-09-01`,
    end: `${year + 1}-08-31`,
    label: `${year}-${year + 1}`,
  }
}

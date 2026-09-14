/**
 * Standard recursive tournament seeding placement: returns an array of length `drawSize`
 * where index i (0-based round-1 slot) holds the seed number (1-based) that belongs there,
 * keeping top seeds apart until the latest possible round (e.g. seed 1 and seed 2 only ever
 * meet in the final). `drawSize` must be a power of 2.
 *
 * Verified reference outputs: computeSeedOrder(2) = [1,2]; computeSeedOrder(4) = [1,4,2,3];
 * computeSeedOrder(8) = [1,8,4,5,2,7,3,6] — the standard 8-draw seeding (1 and 2 in opposite
 * halves, 3 and 4 the next pair apart, etc).
 */
export function computeSeedOrder(drawSize: number): number[] {
  let positions = [1];
  while (positions.length < drawSize) {
    const size = positions.length * 2;
    const next: number[] = [];
    for (const p of positions) {
      next.push(p, size + 1 - p);
    }
    positions = next;
  }
  return positions;
}

/** Mirrors services/api/server/tournament/lib/bracket.ts's totalRounds — number of rounds
 * in a single-elimination draw of this size (drawSize=8 → 3 rounds). */
export function totalRoundsFor(drawSize: number): number {
  return Math.round(Math.log2(drawSize))
}

/**
 * Distributes `totalCents` (>= 0) across the given non-negative integer weights, proportionally,
 * using floor + largest-remainder so the distributed amounts sum EXACTLY to `totalCents` — no
 * float drift, no rounding leak. Internal helper shared by the "total_excluding_license" flat-
 * amount distribution and the reduction-cap scaling.
 */
export function distributeProportionally(
  totalCents: number,
  weights: { key: string; weight: number }[],
): Record<string, number> {
  const result: Record<string, number> = {};
  const sumWeights = weights.reduce((s, w) => s + w.weight, 0);

  if (sumWeights <= 0 || totalCents <= 0) {
    for (const w of weights) result[w.key] = 0;
    return result;
  }

  const raw = weights.map((w) => {
    const exact = (totalCents * w.weight) / sumWeights;
    const flooredValue = Math.floor(exact);
    return { key: w.key, flooredValue, remainder: exact - flooredValue };
  });

  const allocated = raw.reduce((s, r) => s + r.flooredValue, 0);
  let leftover = totalCents - allocated;

  const byRemainderDesc = [...raw].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < byRemainderDesc.length && leftover > 0; i++, leftover--) {
    byRemainderDesc[i].flooredValue += 1;
  }

  for (const r of raw) result[r.key] = r.flooredValue;
  return result;
}

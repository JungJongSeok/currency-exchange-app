/**
 * Non-pure helper: produces a unique-enough id for a single recent lookup.
 * Collision risk is negligible because history is capped at 10 and entries
 * are only compared within a single session. `Math.random()` is sufficient.
 */
export const generateLookupId = (): string => {
  const now = Date.now();
  const rnd = Math.floor(Math.random() * 1_000_000);
  return `lookup_${now}_${rnd}`;
};

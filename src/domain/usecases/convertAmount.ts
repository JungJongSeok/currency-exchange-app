/**
 * Pure conversion: amount × rate, rounded to 4 decimals to prevent floating
 * point drift from leaking into the UI. Negative numbers are mathematically
 * valid and are passed through — the UI validates separately.
 */
export const convertAmount = (amount: number, rate: number): number => {
  const raw = amount * rate;
  const rounded = Math.round(raw * 10000) / 10000;
  return rounded;
};

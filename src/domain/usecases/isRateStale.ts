/**
 * Pure TTL check. A cache entry is stale when `now - fetchedAt > ttl`, i.e.
 * strictly past the TTL boundary. Exactly at the boundary is still fresh.
 *
 * Future-dated `fetchedAt` values (clock skew) are treated as fresh — we
 * won't hammer the network because a device clock is slightly ahead.
 */
export const isRateStale = (
  fetchedAt: string,
  nowMs: number,
  ttlMs: number,
): boolean => {
  const fetchedMs = Date.parse(fetchedAt);
  if (Number.isNaN(fetchedMs)) {
    return true;
  }
  const age = nowMs - fetchedMs;
  if (age < 0) {
    return false;
  }
  return age > ttlMs;
};

/**
 * Data-layer config constants.
 */

export const FRANKFURTER_BASE_URL = 'https://api.frankfurter.app';

/** How long a cached rate is considered fresh. */
export const RATE_TTL_MS = 30 * 60 * 1000;

/** Network fetch timeout for rate/currency endpoints. */
export const FETCH_TIMEOUT_MS = 10 * 1000;

/** MMKV key namespaces. */
export const MMKV_KEY = {
  historyList: 'lookup_history_v1',
  favoritesList: 'favorites_v1',
  currenciesCache: 'currencies_v1',
  rateCachePrefix: 'rate:',
} as const;

/** Max entries for in-app collections. */
export const HISTORY_CAP = 10;
export const FAVORITES_CAP = 20;

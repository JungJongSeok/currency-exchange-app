import type {CurrencyCode} from '../../domain/models/Currency';
import {isRateStale} from '../../domain/usecases/isRateStale';
import {MMKV_KEY, RATE_TTL_MS} from '../config';
import {currencyStorage} from '../storage/mmkvStorage';

interface CachedRate {
  readonly rate: number;
  readonly fetchedAt: string;
}

/**
 * Tiny MMKV wrapper for exchange rate caching. Cache key layout:
 *
 *   rate:${from}:${to}  ->  { rate: number, fetchedAt: ISO }
 *
 * Keys are symmetric neither direction nor inverted — we store exactly what
 * the API returned. Conversions in the other direction pay the network.
 */
export class MmkvRateCacheDataSource {
  private key(from: CurrencyCode, to: CurrencyCode): string {
    return `${MMKV_KEY.rateCachePrefix}${from}:${to}`;
  }

  read(from: CurrencyCode, to: CurrencyCode): CachedRate | null {
    const raw = currencyStorage.getString(this.key(from, to));
    if (raw == null) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as CachedRate;
      if (
        typeof parsed.rate !== 'number' ||
        typeof parsed.fetchedAt !== 'string'
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  getFreshRate(
    from: CurrencyCode,
    to: CurrencyCode,
    nowMs: number = Date.now(),
  ): CachedRate | null {
    const cached = this.read(from, to);
    if (cached == null) {
      return null;
    }
    if (isRateStale(cached.fetchedAt, nowMs, RATE_TTL_MS)) {
      return null;
    }
    return cached;
  }

  write(from: CurrencyCode, to: CurrencyCode, entry: CachedRate): void {
    currencyStorage.set(this.key(from, to), JSON.stringify(entry));
  }
}

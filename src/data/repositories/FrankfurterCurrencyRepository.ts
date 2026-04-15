import type {
  CurrencyCode,
  CurrencyInfo,
  ExchangeRate,
} from '../../domain/models/Currency';
import type {CurrencyRepository} from '../../domain/repositories/CurrencyRepository';
import {AppError} from '../../utils/appError';
import {MMKV_KEY} from '../config';
import {currencyStorage} from '../storage/mmkvStorage';

import type {FrankfurterCurrencyDataSource} from '../datasources/FrankfurterCurrencyDataSource';
import type {MmkvRateCacheDataSource} from '../datasources/MmkvRateCacheDataSource';

/**
 * Concrete CurrencyRepository. Responsibilities:
 *   1. Currency list — persistent MMKV cache (no TTL, frankfurter never
 *      removes codes).
 *   2. Rate lookup — MMKV cache with 30-min TTL, network fallback, stale
 *      fallback on network failure.
 */
export class FrankfurterCurrencyRepository implements CurrencyRepository {
  constructor(
    private readonly api: FrankfurterCurrencyDataSource,
    private readonly rateCache: MmkvRateCacheDataSource,
  ) {}

  async listCurrencies(): Promise<ReadonlyArray<CurrencyInfo>> {
    // Hydrate from MMKV first, then opportunistically refresh.
    const cachedRaw = currencyStorage.getString(MMKV_KEY.currenciesCache);
    if (cachedRaw != null) {
      try {
        const parsed = JSON.parse(cachedRaw) as ReadonlyArray<CurrencyInfo>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fall through
      }
    }

    const fresh = await this.api.fetchCurrencies();
    currencyStorage.set(MMKV_KEY.currenciesCache, JSON.stringify(fresh));
    return fresh;
  }

  async getRate(from: CurrencyCode, to: CurrencyCode): Promise<ExchangeRate> {
    if (from === to) {
      const now = new Date().toISOString();
      return {from, to, rate: 1, fetchedAt: now, isStale: false};
    }

    const fresh = this.rateCache.getFreshRate(from, to);
    if (fresh != null) {
      return {
        from,
        to,
        rate: fresh.rate,
        fetchedAt: fresh.fetchedAt,
        isStale: false,
      };
    }

    try {
      const network = await this.api.fetchLatestRate(from, to);
      const fetchedAt = new Date().toISOString();
      this.rateCache.write(from, to, {rate: network.rate, fetchedAt});
      return {from, to, rate: network.rate, fetchedAt, isStale: false};
    } catch (networkError) {
      const stale = this.rateCache.read(from, to);
      if (stale != null) {
        return {
          from,
          to,
          rate: stale.rate,
          fetchedAt: stale.fetchedAt,
          isStale: true,
        };
      }
      if (networkError instanceof AppError) {
        throw networkError;
      }
      throw new AppError(
        'NetworkError',
        networkError instanceof Error
          ? networkError.message
          : 'unknown network error',
      );
    }
  }
}

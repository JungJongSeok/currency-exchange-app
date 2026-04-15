import type {CurrencyCode, CurrencyInfo, ExchangeRate} from '../models/Currency';

/**
 * Repository contract for currency metadata and exchange rates. Data layer
 * provides a concrete implementation backed by the frankfurter.app API and
 * an MMKV cache. The domain layer does not care which it is.
 */
export interface CurrencyRepository {
  listCurrencies(): Promise<ReadonlyArray<CurrencyInfo>>;
  getRate(from: CurrencyCode, to: CurrencyCode): Promise<ExchangeRate>;
  /**
   * Read a cached rate without triggering any network I/O. Returns `null`
   * when the pair has never been cached. The returned `ExchangeRate` may be
   * stale — callers should inspect `isStale` / `fetchedAt` themselves.
   */
  getCachedRate(
    from: CurrencyCode,
    to: CurrencyCode,
  ): Promise<ExchangeRate | null>;
}

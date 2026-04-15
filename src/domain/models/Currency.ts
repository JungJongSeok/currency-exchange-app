/**
 * Domain models for CurrencyExchangeApp.
 *
 * These types are pure (no RN / no data-layer imports) and fully immutable —
 * all fields are `readonly`. They represent the *domain* vocabulary the rest
 * of the app (store, UI, data adapters) speaks in.
 */

/** ISO 4217 three-letter currency code (e.g. `USD`, `KRW`). */
export type CurrencyCode = string;

export interface CurrencyInfo {
  readonly code: CurrencyCode;
  readonly name: string;
}

export interface ExchangeRate {
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  /** 1 unit of `from` = `rate` units of `to`. */
  readonly rate: number;
  /** ISO-8601 timestamp when the rate was fetched. */
  readonly fetchedAt: string;
  /** True when served from cache past TTL. */
  readonly isStale: boolean;
}

export interface ConversionResult {
  readonly input: number;
  readonly output: number;
  readonly rate: ExchangeRate;
}

export interface RecentLookup {
  readonly id: string;
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  readonly amount: number;
  readonly result: number;
  readonly lookupAt: string;
}

export interface FavoritePair {
  readonly id: string;
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  readonly createdAt: string;
}

export type ExchangeState =
  | {readonly kind: 'idle'}
  | {readonly kind: 'loading'}
  | {readonly kind: 'ready'; readonly result: ConversionResult}
  | {readonly kind: 'error'; readonly message: string};

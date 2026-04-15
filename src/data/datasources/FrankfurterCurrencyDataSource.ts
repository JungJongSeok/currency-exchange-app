import type {CurrencyInfo} from '../../domain/models/Currency';
import {AppError} from '../../utils/appError';
import {FETCH_TIMEOUT_MS, FRANKFURTER_BASE_URL} from '../config';

/**
 * Thin wrapper around the frankfurter.app REST API. All network errors are
 * normalized to `AppError('NetworkError', ...)` so upstream layers never
 * have to distinguish DNS vs timeout vs 500.
 *
 * Docs: https://www.frankfurter.app/docs/
 */
export interface FrankfurterLatestResponse {
  readonly amount: number;
  readonly base: string;
  readonly date: string;
  readonly rates: Readonly<Record<string, number>>;
}

export interface FrankfurterCurrenciesResponse {
  readonly [code: string]: string;
}

const withTimeout = async <T>(
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

export class FrankfurterCurrencyDataSource {
  async fetchCurrencies(): Promise<ReadonlyArray<CurrencyInfo>> {
    return withTimeout(async signal => {
      try {
        const response = await fetch(
          `${FRANKFURTER_BASE_URL}/currencies`,
          {signal},
        );
        if (!response.ok) {
          throw new AppError(
            'NetworkError',
            `currencies request failed with status ${response.status}`,
          );
        }
        const body = (await response.json()) as FrankfurterCurrenciesResponse;
        const list: CurrencyInfo[] = Object.keys(body)
          .sort()
          .map(code => ({code, name: body[code]}));
        return list;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          'NetworkError',
          error instanceof Error ? error.message : 'unknown network error',
        );
      }
    });
  }

  async fetchLatestRate(
    from: string,
    to: string,
  ): Promise<{readonly rate: number; readonly date: string}> {
    return withTimeout(async signal => {
      try {
        const url = `${FRANKFURTER_BASE_URL}/latest?from=${encodeURIComponent(
          from,
        )}&to=${encodeURIComponent(to)}`;
        const response = await fetch(url, {signal});
        if (!response.ok) {
          throw new AppError(
            'NetworkError',
            `latest request failed with status ${response.status}`,
          );
        }
        const body = (await response.json()) as FrankfurterLatestResponse;
        const rate = body.rates[to];
        if (typeof rate !== 'number' || !Number.isFinite(rate)) {
          throw new AppError(
            'NetworkError',
            `rate for ${to} not present in response`,
          );
        }
        return {rate, date: body.date};
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(
          'NetworkError',
          error instanceof Error ? error.message : 'unknown network error',
        );
      }
    });
  }
}

import type {CurrencyCode, CurrencyInfo, ExchangeRate} from '../models/Currency';

/**
 * Repository contract for currency metadata and exchange rates. Data layer
 * provides a concrete implementation backed by the frankfurter.app API and
 * an MMKV cache. The domain layer does not care which it is.
 */
export interface CurrencyRepository {
  listCurrencies(): Promise<ReadonlyArray<CurrencyInfo>>;
  getRate(from: CurrencyCode, to: CurrencyCode): Promise<ExchangeRate>;
}

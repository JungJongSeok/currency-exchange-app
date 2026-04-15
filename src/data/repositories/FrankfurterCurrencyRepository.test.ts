jest.mock('react-native-mmkv', () => {
  class FakeMMKV {
    private store = new Map<string, string>();
    getString(key: string): string | undefined {
      return this.store.get(key);
    }
    set(key: string, value: string): void {
      this.store.set(key, value);
    }
    remove(key: string): void {
      this.store.delete(key);
    }
  }
  return {
    createMMKV: (_opts?: {id: string}): FakeMMKV => new FakeMMKV(),
  };
});

import {FrankfurterCurrencyRepository} from './FrankfurterCurrencyRepository';
import {AppError} from '../../utils/appError';

interface CachedRate {
  readonly rate: number;
  readonly fetchedAt: string;
}

/**
 * Fake implementations of the two data sources — no MMKV, no fetch.
 * Cache is an in-memory Map, API is a scripted function.
 */
class FakeRateCache {
  private store = new Map<string, CachedRate>();

  setFresh(from: string, to: string, entry: CachedRate): void {
    this.store.set(`${from}:${to}`, entry);
    this._fresh = true;
  }

  setStale(from: string, to: string, entry: CachedRate): void {
    this.store.set(`${from}:${to}`, entry);
    this._fresh = false;
  }

  read(from: string, to: string): CachedRate | null {
    return this.store.get(`${from}:${to}`) ?? null;
  }

  getFreshRate(from: string, to: string): CachedRate | null {
    if (!this._fresh) return null;
    return this.read(from, to);
  }

  write(from: string, to: string, entry: CachedRate): void {
    this.store.set(`${from}:${to}`, entry);
    this._fresh = true;
  }

  private _fresh = true;
}

class FakeApi {
  constructor(
    private readonly impl: (
      from: string,
      to: string,
    ) => Promise<{rate: number; date: string}>,
  ) {}

  async fetchCurrencies(): Promise<ReadonlyArray<{code: string; name: string}>> {
    return [
      {code: 'USD', name: 'US Dollar'},
      {code: 'KRW', name: 'Korean Won'},
    ];
  }

  async fetchLatestRate(
    from: string,
    to: string,
  ): Promise<{rate: number; date: string}> {
    return this.impl(from, to);
  }
}

const makeRepo = (
  apiImpl: (from: string, to: string) => Promise<{rate: number; date: string}>,
) => {
  const cache = new FakeRateCache();
  const api = new FakeApi(apiImpl);
  // FakeApi structurally matches FrankfurterCurrencyDataSource's public methods.
  const repo = new FrankfurterCurrencyRepository(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cache as any,
  );
  return {repo, cache, api};
};

describe('FrankfurterCurrencyRepository', () => {
  it('Given 같은 통화 from=to When getRate Then 1.0 rate 즉시 반환', async () => {
    const {repo} = makeRepo(async () => ({rate: 999, date: '2026-04-15'}));
    const rate = await repo.getRate('USD', 'USD');
    expect(rate.rate).toBe(1);
    expect(rate.isStale).toBe(false);
  });

  it('Given fresh cache hit When getRate Then 네트워크 없이 캐시 반환 (isStale=false)', async () => {
    const {repo, cache} = makeRepo(async () => {
      throw new Error('should not be called');
    });
    cache.setFresh('USD', 'KRW', {
      rate: 1340.25,
      fetchedAt: '2026-04-15T12:00:00.000Z',
    });
    const rate = await repo.getRate('USD', 'KRW');
    expect(rate.rate).toBe(1340.25);
    expect(rate.isStale).toBe(false);
  });

  it('Given 캐시 없음 성공 When getRate Then 네트워크 조회 후 fresh 반환', async () => {
    const {repo} = makeRepo(async () => ({rate: 1345.5, date: '2026-04-15'}));
    const rate = await repo.getRate('USD', 'KRW');
    expect(rate.rate).toBe(1345.5);
    expect(rate.isStale).toBe(false);
    expect(rate.from).toBe('USD');
    expect(rate.to).toBe('KRW');
  });

  it('Given stale cache + 네트워크 실패 When getRate Then stale 캐시 반환 (isStale=true)', async () => {
    const {repo, cache} = makeRepo(async () => {
      throw new AppError('NetworkError', 'offline');
    });
    cache.setStale('USD', 'KRW', {
      rate: 1000,
      fetchedAt: '2026-04-14T00:00:00.000Z',
    });
    const rate = await repo.getRate('USD', 'KRW');
    expect(rate.rate).toBe(1000);
    expect(rate.isStale).toBe(true);
  });

  it('Given 캐시 없음 네트워크 실패 When getRate Then AppError throw', async () => {
    const {repo} = makeRepo(async () => {
      throw new AppError('NetworkError', 'offline');
    });
    await expect(repo.getRate('USD', 'KRW')).rejects.toBeInstanceOf(AppError);
  });

  it('Given 캐시 없음 When getCachedRate Then 네트워크 호출 없이 null 반환', async () => {
    const {repo} = makeRepo(async () => {
      throw new Error('should not be called');
    });
    const result = await repo.getCachedRate('USD', 'KRW');
    expect(result).toBeNull();
  });

  it('Given 캐시 존재 When getCachedRate Then 네트워크 없이 ExchangeRate 반환', async () => {
    const {repo, cache} = makeRepo(async () => {
      throw new Error('should not be called');
    });
    cache.setFresh('USD', 'KRW', {
      rate: 1340.25,
      fetchedAt: '2026-04-15T12:00:00.000Z',
    });
    const result = await repo.getCachedRate('USD', 'KRW');
    expect(result).not.toBeNull();
    expect(result?.rate).toBe(1340.25);
    expect(result?.from).toBe('USD');
    expect(result?.to).toBe('KRW');
  });
});

import {isRateStale} from './isRateStale';

const TTL = 30 * 60 * 1000; // 30min

describe('isRateStale', () => {
  it('Given 5분 전 fetchedAt When TTL 30분 Then fresh (false)', () => {
    const now = 1_700_000_000_000;
    const fetched = new Date(now - 5 * 60 * 1000).toISOString();
    expect(isRateStale(fetched, now, TTL)).toBe(false);
  });

  it('Given 정확히 TTL 경계 When 확인 Then fresh (≤ 경계는 fresh)', () => {
    const now = 1_700_000_000_000;
    const fetched = new Date(now - TTL).toISOString();
    expect(isRateStale(fetched, now, TTL)).toBe(false);
  });

  it('Given TTL + 1ms 지남 When 확인 Then stale (true)', () => {
    const now = 1_700_000_000_000;
    const fetched = new Date(now - TTL - 1).toISOString();
    expect(isRateStale(fetched, now, TTL)).toBe(true);
  });

  it('Given 2시간 전 fetchedAt When 확인 Then stale', () => {
    const now = 1_700_000_000_000;
    const fetched = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    expect(isRateStale(fetched, now, TTL)).toBe(true);
  });

  it('Given 미래 시각 (clock skew) When 확인 Then fresh', () => {
    const now = 1_700_000_000_000;
    const fetched = new Date(now + 10 * 1000).toISOString();
    expect(isRateStale(fetched, now, TTL)).toBe(false);
  });

  it('Given 잘못된 ISO 문자열 When 확인 Then stale 반환', () => {
    expect(isRateStale('not-a-date', Date.now(), TTL)).toBe(true);
  });
});

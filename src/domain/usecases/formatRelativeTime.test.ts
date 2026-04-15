import {
  formatRelativeTime,
  relativeTimeDescriptor,
} from './formatRelativeTime';

const BASE = Date.UTC(2026, 3, 15, 12, 0, 0); // 2026-04-15T12:00:00Z

describe('formatRelativeTime', () => {
  it('Given 30초 전 타임스탬프 When 포맷 Then "방금"', () => {
    const iso = new Date(BASE - 30 * 1000).toISOString();
    expect(formatRelativeTime(iso, BASE)).toBe('방금');
  });

  it('Given 5분 전 타임스탬프 When 포맷 Then "5분 전"', () => {
    const iso = new Date(BASE - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(iso, BASE)).toBe('5분 전');
  });

  it('Given 2시간 전 타임스탬프 When 포맷 Then "2시간 전"', () => {
    const iso = new Date(BASE - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(iso, BASE)).toBe('2시간 전');
  });

  it('Given 3일 전 타임스탬프 When 포맷 Then "3일 전"', () => {
    const iso = new Date(BASE - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(iso, BASE)).toBe('3일 전');
  });

  it('Given 미래 타임스탬프 (clock skew) When 포맷 Then "방금"', () => {
    const iso = new Date(BASE + 10 * 60 * 1000).toISOString();
    expect(formatRelativeTime(iso, BASE)).toBe('방금');
  });

  it('Given 잘못된 ISO When 포맷 Then "방금" 폴백', () => {
    expect(formatRelativeTime('not-a-date', BASE)).toBe('방금');
  });

  it('Given descriptor When 1시간 정확히 경과 Then kind=hours, value=1', () => {
    const iso = new Date(BASE - 60 * 60 * 1000).toISOString();
    expect(relativeTimeDescriptor(iso, BASE)).toEqual({
      kind: 'hours',
      value: 1,
    });
  });
});

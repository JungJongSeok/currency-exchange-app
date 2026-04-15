import {convertAmount} from './convertAmount';

describe('convertAmount', () => {
  it('Given 100 rate 1.5 When 변환 Then 150 반환', () => {
    expect(convertAmount(100, 1.5)).toBe(150);
  });

  it('Given 0 rate 1.5 When 변환 Then 0 반환', () => {
    expect(convertAmount(0, 1.5)).toBe(0);
  });

  it('Given 1 rate 0 When 변환 Then 0 반환', () => {
    expect(convertAmount(1, 0)).toBe(0);
  });

  it('Given 100 rate 1340.25 (USD→KRW) When 변환 Then 134025 반환', () => {
    expect(convertAmount(100, 1340.25)).toBe(134025);
  });

  it('Given 소수 입력 12.34 rate 1.1 When 변환 Then 4자리 반올림', () => {
    // 12.34 * 1.1 = 13.574
    expect(convertAmount(12.34, 1.1)).toBeCloseTo(13.574, 4);
  });

  it('Given 매우 큰 수치 When 변환 Then 정확 반환', () => {
    expect(convertAmount(1_000_000, 1340.25)).toBe(1_340_250_000);
  });

  it('Given 음수 입력 When 변환 Then 음수 반환 (UI가 별도 검증)', () => {
    expect(convertAmount(-50, 2)).toBe(-100);
  });

  it('Given 반올림이 필요한 값 When 변환 Then 4 decimals 유지', () => {
    // 1/3 ~= 0.33333... -> 0.3333
    expect(convertAmount(1, 1 / 3)).toBe(0.3333);
  });
});

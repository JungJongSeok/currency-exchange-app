import {currencyToFlag} from './currencyToFlag';

describe('currencyToFlag', () => {
  it('Given USD When 플래그 조회 Then 🇺🇸 반환', () => {
    expect(currencyToFlag('USD')).toBe('🇺🇸');
  });

  it('Given KRW When 플래그 조회 Then 🇰🇷 반환', () => {
    expect(currencyToFlag('KRW')).toBe('🇰🇷');
  });

  it('Given EUR When 플래그 조회 Then 🇪🇺 반환', () => {
    expect(currencyToFlag('EUR')).toBe('🇪🇺');
  });

  it('Given JPY When 플래그 조회 Then 🇯🇵 반환', () => {
    expect(currencyToFlag('JPY')).toBe('🇯🇵');
  });

  it('Given GBP When 플래그 조회 Then 🇬🇧 반환', () => {
    expect(currencyToFlag('GBP')).toBe('🇬🇧');
  });

  it('Given 소문자 usd When 플래그 조회 Then 대소문자 무시하고 🇺🇸 반환', () => {
    expect(currencyToFlag('usd')).toBe('🇺🇸');
  });

  it('Given 앞뒤 공백 "  KRW  " When 플래그 조회 Then 트림 후 🇰🇷 반환', () => {
    expect(currencyToFlag('  KRW  ')).toBe('🇰🇷');
  });

  it('Given 알 수 없는 코드 XYZ When 플래그 조회 Then 기본 🏳️ 반환', () => {
    expect(currencyToFlag('XYZ')).toBe('🏳️');
  });

  it('Given 빈 문자열 When 플래그 조회 Then 기본 🏳️ 반환', () => {
    expect(currencyToFlag('')).toBe('🏳️');
  });

  it('Given AED When 플래그 조회 Then 🇦🇪 반환', () => {
    expect(currencyToFlag('AED')).toBe('🇦🇪');
  });

  it('Given SGD When 플래그 조회 Then 🇸🇬 반환', () => {
    expect(currencyToFlag('SGD')).toBe('🇸🇬');
  });

  it('Given THB When 플래그 조회 Then 🇹🇭 반환', () => {
    expect(currencyToFlag('THB')).toBe('🇹🇭');
  });
});

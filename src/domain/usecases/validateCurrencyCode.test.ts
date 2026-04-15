import {validateCurrencyCode} from './validateCurrencyCode';

describe('validateCurrencyCode', () => {
  it('Given 빈 문자열 When 검증 Then ok=false empty 반환', () => {
    const result = validateCurrencyCode('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('empty');
    }
  });

  it('Given null When 검증 Then ok=false empty 반환', () => {
    const result = validateCurrencyCode(null);
    expect(result.ok).toBe(false);
  });

  it('Given undefined When 검증 Then ok=false empty 반환', () => {
    const result = validateCurrencyCode(undefined);
    expect(result.ok).toBe(false);
  });

  it('Given 두 글자 코드 US When 검증 Then ok=false format 반환', () => {
    const result = validateCurrencyCode('US');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('format');
    }
  });

  it('Given 네 글자 코드 USDA When 검증 Then ok=false format 반환', () => {
    const result = validateCurrencyCode('USDA');
    expect(result.ok).toBe(false);
  });

  it('Given 소문자 usd When 검증 Then ok=false format 반환', () => {
    const result = validateCurrencyCode('usd');
    expect(result.ok).toBe(false);
  });

  it('Given 숫자 포함 US1 When 검증 Then ok=false format 반환', () => {
    const result = validateCurrencyCode('US1');
    expect(result.ok).toBe(false);
  });

  it('Given 대문자 3자 USD When 검증 Then ok=true code=USD 반환', () => {
    const result = validateCurrencyCode('USD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).toBe('USD');
    }
  });

  it('Given 존재하지 않는 코드 ABC When 검증 Then ok=true 반환 (도메인은 목록 검증 안 함)', () => {
    const result = validateCurrencyCode('ABC');
    expect(result.ok).toBe(true);
  });

  it('Given KRW When 검증 Then ok=true 반환', () => {
    const result = validateCurrencyCode('KRW');
    expect(result.ok).toBe(true);
  });
});

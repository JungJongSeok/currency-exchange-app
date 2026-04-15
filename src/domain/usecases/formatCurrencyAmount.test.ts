import {formatCurrencyAmount} from './formatCurrencyAmount';

describe('formatCurrencyAmount', () => {
  it('Given 1340 KRW When 포맷 Then ₩1,340 (소수점 없음)', () => {
    expect(formatCurrencyAmount(1340, 'KRW')).toBe('₩1,340');
  });

  it('Given 1234567 KRW When 포맷 Then 천단위 쉼표', () => {
    expect(formatCurrencyAmount(1234567, 'KRW')).toBe('₩1,234,567');
  });

  it('Given 1340.6 KRW When 포맷 Then ₩1,341 (반올림)', () => {
    expect(formatCurrencyAmount(1340.6, 'KRW')).toBe('₩1,341');
  });

  it('Given 130 JPY When 포맷 Then ¥130', () => {
    expect(formatCurrencyAmount(130, 'JPY')).toBe('¥130');
  });

  it('Given 1.5 USD When 포맷 Then $1.50', () => {
    expect(formatCurrencyAmount(1.5, 'USD')).toBe('$1.50');
  });

  it('Given 1234.56 USD When 포맷 Then $1,234.56', () => {
    expect(formatCurrencyAmount(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('Given 1234.5 EUR When 포맷 Then €1.234,50 (유럽식)', () => {
    expect(formatCurrencyAmount(1234.5, 'EUR')).toBe('€1.234,50');
  });

  it('Given 1.5 EUR When 포맷 Then €1,50', () => {
    expect(formatCurrencyAmount(1.5, 'EUR')).toBe('€1,50');
  });

  it('Given 99.99 GBP When 포맷 Then £99.99', () => {
    expect(formatCurrencyAmount(99.99, 'GBP')).toBe('£99.99');
  });

  it('Given 1.5 CAD When 포맷 Then CAD 1.50 (default)', () => {
    expect(formatCurrencyAmount(1.5, 'CAD')).toBe('CAD 1.50');
  });

  it('Given 1234.5 AUD When 포맷 Then AUD 1,234.50', () => {
    expect(formatCurrencyAmount(1234.5, 'AUD')).toBe('AUD 1,234.50');
  });

  it('Given -100 USD When 포맷 Then -$100.00 (음수 부호)', () => {
    expect(formatCurrencyAmount(-100, 'USD')).toBe('-$100.00');
  });

  it('Given -1340 KRW When 포맷 Then -₩1,340', () => {
    expect(formatCurrencyAmount(-1340, 'KRW')).toBe('-₩1,340');
  });

  it('Given 0 USD When 포맷 Then $0.00', () => {
    expect(formatCurrencyAmount(0, 'USD')).toBe('$0.00');
  });

  it('Given NaN When 포맷 Then CODE 0 폴백', () => {
    expect(formatCurrencyAmount(Number.NaN, 'USD')).toContain('0');
  });

  it('Given 소문자 usd When 포맷 Then 대문자 코드로 처리', () => {
    expect(formatCurrencyAmount(1, 'usd')).toBe('$1.00');
  });
});

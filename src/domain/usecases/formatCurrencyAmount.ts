import type {CurrencyCode} from '../models/Currency';

/**
 * Hand-rolled currency formatter.
 *
 * Why not Intl.NumberFormat? Hermes ships without full ICU, so
 * Intl.NumberFormat silently degrades to en-US-only in release builds. We
 * format the handful of high-traffic currencies manually and fall back to
 * `CODE 1,234.56` for anything exotic.
 *
 * Conventions:
 *   - KRW / JPY: zero decimals, comma thousands, glyph prefix (₩ / ¥).
 *   - USD       : 2 decimals, dot decimal, comma thousands ($).
 *   - EUR       : 2 decimals, comma decimal, dot thousands (€).
 *   - GBP       : 2 decimals, dot decimal, comma thousands (£).
 *   - default   : `CODE 1,234.56` (dot decimal, comma thousands).
 *
 * Negative numbers render as `-₩1,234`, `-$1.50`, etc.
 */

interface NumberParts {
  readonly sign: string;
  readonly integer: string;
  readonly fraction: string; // no leading dot
}

const splitNumber = (value: number, decimals: number): NumberParts => {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const factor = Math.pow(10, decimals);
  const scaled = Math.round(abs * factor);
  const intPart = Math.floor(scaled / factor).toString();
  const fracPartRaw = (scaled % factor).toString();
  const fracPart = decimals === 0 ? '' : fracPartRaw.padStart(decimals, '0');
  return {sign, integer: intPart, fraction: fracPart};
};

const groupThousands = (integerDigits: string, separator: string): string => {
  if (integerDigits.length <= 3) {
    return integerDigits;
  }
  const chars = integerDigits.split('');
  const result: string[] = [];
  for (let i = 0; i < chars.length; i += 1) {
    if (i > 0 && (chars.length - i) % 3 === 0) {
      result.push(separator);
    }
    result.push(chars[i]);
  }
  return result.join('');
};

export const formatCurrencyAmount = (
  amount: number,
  code: CurrencyCode,
): string => {
  if (!Number.isFinite(amount)) {
    return `${code} 0`;
  }

  const upperCode = code.toUpperCase();

  if (upperCode === 'KRW' || upperCode === 'JPY') {
    const {sign, integer} = splitNumber(amount, 0);
    const glyph = upperCode === 'KRW' ? '₩' : '¥';
    return `${sign}${glyph}${groupThousands(integer, ',')}`;
  }

  if (upperCode === 'USD') {
    const {sign, integer, fraction} = splitNumber(amount, 2);
    return `${sign}$${groupThousands(integer, ',')}.${fraction}`;
  }

  if (upperCode === 'GBP') {
    const {sign, integer, fraction} = splitNumber(amount, 2);
    return `${sign}£${groupThousands(integer, ',')}.${fraction}`;
  }

  if (upperCode === 'EUR') {
    const {sign, integer, fraction} = splitNumber(amount, 2);
    return `${sign}€${groupThousands(integer, '.')},${fraction}`;
  }

  const {sign, integer, fraction} = splitNumber(amount, 2);
  return `${sign}${upperCode} ${groupThousands(integer, ',')}.${fraction}`;
};

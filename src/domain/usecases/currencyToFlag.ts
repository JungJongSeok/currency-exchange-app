/**
 * currencyToFlag — pure mapping from a currency code to a flag emoji.
 *
 * Covers the 30+ most common currencies served by frankfurter.app. Inputs are
 * normalised to uppercase so mixed-case / lowercase code strings Just Work.
 * Unknown codes fall back to the white flag (🏳️) so callers never have to
 * branch on `null`.
 */

import type {CurrencyCode} from '../models/Currency';

const FLAG_MAP: Readonly<Record<string, string>> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  KRW: '🇰🇷',
  CNY: '🇨🇳',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  HKD: '🇭🇰',
  SGD: '🇸🇬',
  INR: '🇮🇳',
  BRL: '🇧🇷',
  RUB: '🇷🇺',
  THB: '🇹🇭',
  PHP: '🇵🇭',
  IDR: '🇮🇩',
  MYR: '🇲🇾',
  VND: '🇻🇳',
  MXN: '🇲🇽',
  TRY: '🇹🇷',
  ZAR: '🇿🇦',
  NZD: '🇳🇿',
  SEK: '🇸🇪',
  NOK: '🇳🇴',
  DKK: '🇩🇰',
  PLN: '🇵🇱',
  CZK: '🇨🇿',
  HUF: '🇭🇺',
  ILS: '🇮🇱',
  AED: '🇦🇪',
};

const FALLBACK_FLAG = '🏳️';

export const currencyToFlag = (code: CurrencyCode): string => {
  if (typeof code !== 'string' || code.length === 0) {
    return FALLBACK_FLAG;
  }
  const normalised = code.trim().toUpperCase();
  return FLAG_MAP[normalised] ?? FALLBACK_FLAG;
};

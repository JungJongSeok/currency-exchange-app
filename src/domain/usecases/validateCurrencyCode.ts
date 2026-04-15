import type {CurrencyCode} from '../models/Currency';

export type ValidateCurrencyCodeResult =
  | {readonly ok: true; readonly code: CurrencyCode}
  | {readonly ok: false; readonly reason: string};

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/**
 * Validate a user-supplied currency code string. Enforces ISO 4217 surface:
 * exactly three uppercase Latin letters. Existence in the frankfurter
 * catalogue is NOT checked here — that is a data-layer concern.
 */
export const validateCurrencyCode = (
  code: string | null | undefined,
): ValidateCurrencyCodeResult => {
  if (code == null) {
    return {ok: false, reason: 'empty'};
  }
  if (code.length === 0) {
    return {ok: false, reason: 'empty'};
  }
  if (!CURRENCY_CODE_PATTERN.test(code)) {
    return {ok: false, reason: 'format'};
  }
  return {ok: true, code};
};
